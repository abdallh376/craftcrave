import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'ar';

const SUPPORTED: Language[] = ['en', 'ar'];

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // signal عشان أي زرار أو قالب يتحدث لوحده لما اللغة تتغير
  currentLang = signal<Language>('en');

  private isBrowser: boolean;

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    let initialLang: Language = 'en';

    if (this.isBrowser) {
      const saved = localStorage.getItem('lang');
      const browserLang: Language = navigator.language?.startsWith('ar') ? 'ar' : 'en';
      // اللغة المحفوظة ليها الأولوية، بشرط تكون من اللغات المدعومة
      initialLang = SUPPORTED.includes(saved as Language) ? (saved as Language) : browserLang;
    }

    this.changeLanguage(initialLang);
  }

  changeLanguage(lang: Language) {
    this.currentLang.set(lang);
    this.translate.use(lang);
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (this.isBrowser) {
      localStorage.setItem('lang', lang);
    }
  }

  toggleLanguage() {
    this.changeLanguage(this.currentLang() === 'en' ? 'ar' : 'en');
  }
}
