import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];

  constructor(
    private favoritesService: FavoritesService, 
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.favoritesService.favorites$.subscribe(favs => {
      const currentCart = this.cartService.getCart();
      this.favorites = favs.map(item => {
        const cartItem = currentCart.find((ci: any) => ci._id === item._id || ci.id === item._id);
        return {
          ...item,
          orderQuantity: cartItem ? cartItem.orderQuantity : (item.orderQuantity || 0)
        };
      });
    });
  }

  removeFav(item: any) {
    this.favoritesService.toggleFavorite(item);
  }

  addToCart(item: any) {
    item.orderQuantity = 1;
    this.cartService.addToCart(item);
  }

  increaseQuantity(item: any) {
    item.orderQuantity = (item.orderQuantity || 1) + 1;
    this.cartService.addToCart(item);
  }

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
}