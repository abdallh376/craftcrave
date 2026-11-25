import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { ItemDetailsComponent } from './components/item-details/item-details';
import { FavoritesComponent } from './components/favorites/favorites';
import { CartComponent } from './components/cart/cart';
import { BuyComponent } from './components/buy/buy';
import { DashboardComponent } from './components/dashboard/dashboard';
import { LoginComponent } from './components/login/login'; 
import { authGuard } from './guards/auth.guard'; // تم تعديل المسار بناءً على مكان المجلد // 1. استيراد حارس الحماية

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'item/:id', component: ItemDetailsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'cart', component: CartComponent },
  { path: 'buy', component: BuyComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] // 2. حماية صفحة الداشبورد لمنع الدخول بدون تسجيل خروج أو صلاحيات
  },
  { path: '**', redirectTo: '' }
];