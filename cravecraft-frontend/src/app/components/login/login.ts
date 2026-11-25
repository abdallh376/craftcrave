import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { ApiService } from '../../services/api.service'; 
// تأكد من المسار الصحيح للـ service عندك

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private api: ApiService, // <--- حقنا الـ ApiService هنا عشان الخطأ يختفي
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('isManagerLoggedIn') === 'true') {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  onLogin() {
    this.api.adminLogin({ username: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        const token = res.token || res.accessToken || res.data?.token;
        
        if (token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('isManagerLoggedIn', 'true');
          localStorage.setItem('managerToken', token);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = this.translate.instant('login.noToken');
        }
      },
      error: (err: any) => {
        console.error('تفاصيل خطأ تسجيل الدخول:', err); // <--- السطر ده هيطبع السبب الحقيقي في الـ Console
        this.errorMessage = err.error?.message || this.translate.instant('login.invalid');
      }
    });
  }
}