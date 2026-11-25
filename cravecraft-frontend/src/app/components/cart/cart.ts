import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
  }

  // زيادة الكمية (+)
  increaseQuantity(item: any) {
    item.orderQuantity = (item.orderQuantity || 1) + 1;
    this.saveAndUpdate();
  }

  // تقليل الكمية (-)
  decreaseQuantity(item: any) {
    const currentQty = item.orderQuantity || 1;
    if (currentQty > 1) {
      item.orderQuantity = currentQty - 1;
      this.saveAndUpdate();
    } else {
      this.removeItem(item._id);
    }
  }

  // دالة مساعدة لحفظ السلة وتحديث الإجمالي
  saveAndUpdate() {
    // لو الـ CartService فيها دالة لحفظ السلة مباشرة (زي saveCart أو setCart) استعملها، أو سيبها تتحدث تلقائياً
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((acc, item) => acc + (item.price * (item.orderQuantity || 1)), 0);
  }
}