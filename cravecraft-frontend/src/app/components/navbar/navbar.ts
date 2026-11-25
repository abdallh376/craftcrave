import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './navbar.html'
})
export class NavbarComponent implements OnInit {
  cartCount: number = 0;
  favCount: number = 0;

  constructor(
    private cartService: CartService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + (item.orderQuantity || 1), 0);
    });

    this.favoritesService.favorites$.subscribe(favs => {
      this.favCount = favs.length;
    });
  }
}