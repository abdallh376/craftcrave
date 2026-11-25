
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';

import {
  retry,
  timer,
  throwError,
  finalize,
  Subscription
} from 'rxjs';

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './buy.html',
  styleUrls: ['./buy.css']
})
export class BuyComponent implements OnInit, OnDestroy {

  // ======================================
  // Customer Information
  // ======================================

  orderData = {
    fullName: '',
    email: '',
    phone: '',
    address: ''
  };

  // ======================================
  // Modal & Loading
  // ======================================

  showModal = false;

  modalType: 'confirm' | 'success' = 'confirm';

  isLoading = false;

  createdOrder: any = null;

  // ======================================
  // Subscriptions
  // ======================================

  private routeSubscription?: Subscription;

  private processedSessionId: string | null = null;

  constructor(
    private api: ApiService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  // ======================================
  // Component Initialization
  // ======================================

  ngOnInit(): void {

    this.routeSubscription =
      this.route.queryParamMap.subscribe(params => {

        const payment = params.get('payment');

        const sessionId = params.get('session_id');

        console.log('========== STRIPE RETURN ==========');
        console.log('Current URL:', window.location.href);
        console.log('Stripe payment:', payment);
        console.log('Stripe session ID:', sessionId);
        console.log('===================================');

        // Successful payment
        if (payment === 'success' && sessionId) {

          if (this.processedSessionId === sessionId) {
            return;
          }

          this.processedSessionId = sessionId;

          this.verifyPayment(sessionId);

          return;
        }

        // Cancelled payment
        if (payment === 'cancelled') {

          alert(
            'تم إلغاء عملية الدفع. سلتك ما زالت محفوظة ويمكنك المحاولة مرة أخرى.'
          );

          this.removePaymentParams();

          return;
        }

        // Missing session ID
        if (payment === 'success' && !sessionId) {

          console.error('Stripe returned without session_id.');

          alert(
            'تم الرجوع من صفحة الدفع ولكن رقم جلسة الدفع غير موجود في الرابط.'
          );

        }

      });

  }

  // ======================================
  // Verify Stripe Payment
  // ======================================

  private verifyPayment(sessionId: string): void {

    console.log('Starting payment verification:', sessionId);

    this.isLoading = true;

    this.cdr.detectChanges();

    this.api.getPaidOrder(sessionId).pipe(

      retry({

        count: 5,

        delay: (error, retryCount) => {

          console.log('Payment verification error:', error);

          if (error.status === 409 || error.status === 503) {

            console.log(
              `Retry payment verification: ${retryCount}`
            );

            return timer(2000);
          }

          return throwError(() => error);

        }

      }),

      finalize(() => {

        this.isLoading = false;

        this.cdr.detectChanges();

      })

    ).subscribe({

      next: (res: any) => {

        console.log('========== PAYMENT RESPONSE ==========');

        console.log('Full API response:', res);

        const order =
          res?.savedOrder ||
          res?.order ||
          res;

        console.log('Extracted order:', order);

        console.log('Payment status:', order?.paymentStatus);

        console.log('Order items:', order?.items);

        console.log('======================================');

        // Validate order
        if (
          !order ||
          !Array.isArray(order.items) ||
          order.items.length === 0
        ) {

          this.processedSessionId = null;

          alert(
            'تم الدفع، لكن لم يتم استلام تفاصيل الفاتورة. راجع بيانات API.'
          );

          return;
        }

        // Validate payment status
        if (order.paymentStatus !== 'paid') {

          this.processedSessionId = null;

          alert(
            'تم الرجوع من Stripe، لكن حالة الدفع لم يتم تأكيدها.'
          );

          return;
        }

        // Save invoice data
        this.createdOrder = {
          ...res,
          savedOrder: order
        };

        console.log('Invoice data:', this.createdOrder);

        // Clear cart after successful payment
        this.cartService.clearCart();

        // Show success invoice
        this.modalType = 'success';

        this.showModal = true;

        this.cdr.detectChanges();

        console.log('Success invoice modal opened.');

        // Remove Stripe query parameters
        this.removePaymentParams();

      },

      error: (err) => {

        console.error('Payment verification failed:', err);

        console.error('API error response:', err.error);

        this.processedSessionId = null;

        alert(
          err.error?.message ||
          'تعذر التحقق من الدفع. يرجى التواصل معنا.'
        );

      }

    });

  }

  // ======================================
  // Remove Stripe Query Parameters
  // ======================================

  private removePaymentParams(): void {

    this.router.navigate([], {

      relativeTo: this.route,

      queryParams: {},

      replaceUrl: true

    });

  }

  // ======================================
  // Open Confirmation Modal
  // ======================================

  confirmBeforeOrder(): void {

    const cartItems = this.cartService.getCart();

    if (cartItems.length === 0) {

      alert(
        this.translate.instant('buy.emptyCart')
      );

      return;
    }

    this.modalType = 'confirm';

    this.showModal = true;

    this.cdr.detectChanges();

  }

  // ======================================
  // Create Order
  // ======================================

  placeOrder(): void {

    const cartItems = this.cartService.getCart();

    if (cartItems.length === 0) {

      alert(
        this.translate.instant('buy.emptyCart')
      );

      return;
    }

    this.isLoading = true;

    this.cdr.detectChanges();

    const totalAmount = cartItems.reduce(

      (acc, item) => {

        return acc + (
          item.price * item.orderQuantity
        );

      },

      0

    );

    const payload = {

      userDetails: this.orderData,

      items: cartItems.map(item => ({

        itemId: item._id,

        name: item.name,

        price: item.price,

        orderQuantity: item.orderQuantity

      })),

      totalAmount,

      notes: 'Placed via web app'

    };

    this.api.createOrder(payload).subscribe({

      next: (res: any) => {

        this.isLoading = false;

        console.log('Created order response:', res);

        if (!res?.checkoutUrl) {

          this.showModal = false;

          alert(
            'تم إنشاء الطلب لكن رابط الدفع غير متاح. راجع إعدادات Stripe.'
          );

          this.cdr.detectChanges();

          return;
        }

        // Redirect to Stripe Checkout
        window.location.href = res.checkoutUrl;

      },

      error: (err) => {

        this.isLoading = false;

        this.showModal = false;

        this.cdr.detectChanges();

        console.error('Create order error:', err);

        console.error('API error response:', err.error);

        alert(

          this.translate.instant('buy.failed', {

            reason:
              err.error?.message ||
              this.translate.instant('buy.badRequest')

          })

        );

      }

    });

  }

  // ======================================
  // Close Modal
  // ======================================

  closeModal(): void {

    this.showModal = false;

    if (this.modalType === 'success') {

      this.router.navigate(['/']);

    }

  }

  // ======================================
  // Component Destroy
  // ======================================

  ngOnDestroy(): void {

    this.routeSubscription?.unsubscribe();

  }

}
