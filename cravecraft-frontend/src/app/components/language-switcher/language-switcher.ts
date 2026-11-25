import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <button
      type="button"
      (click)="languageService.toggleLanguage()"
      [attr.aria-label]="'lang.toggleAria' | translate"
      class="flex items-center gap-2 bg-gray-800/60 hover:bg-amber-500 text-gray-200 hover:text-white px-3 py-2 rounded-xl border border-gray-700/60 hover:border-amber-500 text-sm font-bold cursor-pointer transition">
      <span>🌐</span>
      <span>{{ 'lang.toggle' | translate }}</span>
    </button>
  `
})
export class LanguageSwitcherComponent {
  constructor(public languageService: LanguageService) {}
}
