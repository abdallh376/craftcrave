import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];
  activeCategory: string = 'All';

  constructor(
    private api: ApiService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.api.getPublicItems().subscribe({
      next: (res: any) => {
        const dataList = Array.isArray(res) ? res : (res.data || res.items || res.products || []);
        
        const currentCart = this.cartService.getCart();
        this.items = dataList.map((item: any) => {
          const cartItem = currentCart.find((ci: any) => ci._id === item._id || ci.id === item._id);
          return {
            ...item,
            orderQuantity: cartItem ? cartItem.orderQuantity : 0
          };
        });

        this.filteredItems = this.items;
        this.activeCategory = 'All';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load items:', err);
      }
    });
  }

  filterCategory(category: string) {
    this.activeCategory = category;
    if (category === 'All') {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter((item: any) => item.category === category);
    }
  }

  // إضافة المنتج للسلة لأول مرة وتفعيل أزرار الـ (+ / -)
  addToCart(item: any) {
    item.orderQuantity = 1;
    this.cartService.addToCart(item);
  }

  // زيادة الكمية (+)
  increaseQuantity(item: any) {
    item.orderQuantity = (item.orderQuantity || 1) + 1;
    this.cartService.addToCart(item);
  }

  // تقليل الكمية (-)
  decreaseQuantity(item: any) {
    const currentQty = item.orderQuantity || 1;
    if (currentQty > 1) {
      item.orderQuantity = currentQty - 1;
      this.cartService.addToCart(item);
    } else {
      item.orderQuantity = 0;
      this.cartService.removeFromCart(item._id || item.id);
    }
  }

  toggleFavorite(item: any) {
    this.favoritesService.toggleFavorite(item);
  }

  isFavorite(id: string): boolean {
    return this.favoritesService.isFavorite(id);
  }
}