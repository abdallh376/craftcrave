import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  activeTab: string = 'orders';
  orders: any[] = [];
  filteredOrders: any[] = [];
  products: any[] = [];
  searchQuery: string = '';

  newProduct = {
    name: '',
    price: null,
    stock: 10,
    category: 'Burgers',
    image: '',
    description: ''
  };

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.zone.run(() => {
      this.loadOrders();
      this.loadProducts();
    });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'orders') {
      this.loadOrders();
    } else if (tab === 'products') {
      this.loadProducts();
    }
  }

  loadOrders() {
    this.api.getOrders().subscribe({
      next: (res: any) => {
        let ordersData = [];
        if (Array.isArray(res)) {
          ordersData = res;
        } else if (res && Array.isArray(res.orders)) {
          ordersData = res.orders;
        } else if (res && Array.isArray(res.data)) {
          ordersData = res.data;
        } else if (res && res.data && Array.isArray(res.data.orders)) {
          ordersData = res.data.orders;
        }

        this.orders = ordersData;
        this.filteredOrders = ordersData;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('خطأ في جلب الطلبات:', err);
      }
    });
  }

  loadProducts() {
    this.api.getProducts().subscribe({
      next: (res: any) => {
        let productsData = [];
        if (Array.isArray(res)) {
          productsData = res;
        } else if (res && Array.isArray(res.products)) {
          productsData = res.products;
        } else if (res && Array.isArray(res.data)) {
          productsData = res.data;
        }

        this.products = productsData;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('خطأ في جلب المنتجات:', err);
      }
    });
  }

  searchOrders() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredOrders = [...this.orders];
      return;
    }
    this.filteredOrders = this.orders.filter(order => {
      const name = (order.userDetails?.fullName || order.customerName || '').toLowerCase();
      const phone = (order.userDetails?.phone || order.phone || '').toLowerCase();
      const id = (order._id || order.id || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || id.includes(q);
    });
  }

  updateStatus(order: any, newStatus: string) {
    const orderId = order._id || order.id;
    this.api.updateOrderStatus(orderId, { status: newStatus }).subscribe({
      next: () => { 
        order.status = newStatus; 
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('خطأ في تحديث الحالة:', err)
    });
  }

  // تحديث دالة إضافة ملاحظة جديدة للسجل بالتاريخ
  addOrderNote(orderId: string, text: string) {
    if (!text || !text.trim()) return;

    this.api.updateOrderNotes(orderId, { text }).subscribe({
      next: (res: any) => { 
        // إعادة تحميل الطلبات لتحديث السجل والعرض بالواجهة فوراً
        this.loadOrders();
      },
      error: (err: any) => console.error('خطأ في إضافة الملاحظة:', err)
    });
  }

  addProduct() {
    if (!this.newProduct.name || !this.newProduct.price) {
      alert(this.translate.instant('dashboard.needNameAndPrice'));
      return;
    }

    const productPayload = {
      name: this.newProduct.name,
      price: Number(this.newProduct.price),
      stock: Number(this.newProduct.stock) || 10,
      category: this.newProduct.category,
      image: this.newProduct.image || '',
      description: this.newProduct.description || ''
    };

    this.api.createProduct(productPayload).subscribe({
      next: (res: any) => {
        alert(this.translate.instant('dashboard.productAdded'));
        this.newProduct = { name: '', price: null, stock: 10, category: 'Burgers', image: '', description: '' };
        this.loadProducts();
      },
      error: (err: any) => {
        console.error('خطأ أثناء إضافة المنتج:', err);
        alert(this.translate.instant('dashboard.productAddFailed'));
      }
    });
  }

  // استبدال الحذف النهائي بنظام التفعيل والتعطيل (Active / Deactive)
  toggleProductStatus(product: any) {
    const productId = product._id || product.id;

    this.api.toggleProductStatus(productId).subscribe({
      next: (res: any) => {
        // عكس الحالة محلياً فوراً لتحديث لون الزر والنص
        product.isActive = !product.isActive;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('خطأ في تبديل حالة المنتج:', err)
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isManagerLoggedIn');
      localStorage.removeItem('managerToken');
    }
    this.router.navigate(['/login']);
  }
}