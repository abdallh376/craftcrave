import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favKey = 'cravecraft_favorites';
  private favSubject = new BehaviorSubject<any[]>(this.getFavorites());
  favorites$ = this.favSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getFavorites(): any[] {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.favKey);
      return data ? JSON.parse(data) : [];
    }
    return [];
  }

  toggleFavorite(item: any) {
    let favs = this.getFavorites();
    const index = favs.findIndex(i => i._id === item._id);
    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(item);
    }
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.favKey, JSON.stringify(favs));
    }
    this.favSubject.next(favs);
  }

  isFavorite(id: string): boolean {
    return this.getFavorites().some(i => i._id === id);
  }
}