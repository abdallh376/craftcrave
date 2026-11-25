import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cravecraft_cart';
  private cartSubject = new BehaviorSubject<any[]>(this.getCart());
  cart$ = this.cartSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getCart(): any[] {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.cartKey);
      return data ? JSON.parse(data) : [];
    }
    return [];
  }

  addToCart(item: any, quantity: number = 1) {
    let cart = this.getCart();
    const index = cart.findIndex(i => i._id === item._id);
    if (index > -1) {
      cart[index].orderQuantity += quantity;
    } else {
      cart.push({ ...item, orderQuantity: quantity });
    }
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.cartKey, JSON.stringify(cart));
    }
    this.cartSubject.next(cart);
  }

  removeFromCart(id: string) {
    let cart = this.getCart().filter(i => i._id !== id);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.cartKey, JSON.stringify(cart));
    }
    this.cartSubject.next(cart);
  }

  clearCart() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.cartKey);
    }
    this.cartSubject.next([]);
  }
}