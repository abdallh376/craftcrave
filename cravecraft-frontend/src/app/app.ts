import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { LanguageService } from './services/language.service';
import { CartService } from './services/cart.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <!-- تظهر الـ Navbar فقط إذا لم نكن في صفحة الـ dashboard أو login -->
    <app-navbar *ngIf="!router.url.includes('/dashboard') && !router.url.includes('/login')"></app-navbar>

    <router-outlet></router-outlet>

    <!-- يظهر الـ Footer فقط إذا لم نكن في صفحة الـ dashboard أو login -->
    <app-footer *ngIf="!router.url.includes('/dashboard') && !router.url.includes('/login')"></app-footer>
  `
})
export class App {
  // حقن الـ LanguageService هنا بيخليها تشتغل أول ما التطبيق يبدأ (تطبق اللغة المحفوظة + اتجاه الصفحة)
  constructor(public router: Router, private languageService: LanguageService, private cartService: CartService) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const params = this.router.parseUrl(this.router.url).queryParams;
      if (params['payment'] === 'success') {
        this.cartService.clearCart();
        alert('تم تأكيد الدفع بنجاح. شكرًا لطلبك!');
      } else if (params['payment'] === 'cancelled') {
        alert('تم إلغاء الدفع. سلتك ما زالت محفوظة ويمكنك المحاولة مرة أخرى.');
      }
    });
  }
}