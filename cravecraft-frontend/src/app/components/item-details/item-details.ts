import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './item-details.html',
  styleUrls: ['./item-details.css']
})
export class ItemDetailsComponent implements OnInit {
  item: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cartService: CartService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getPublicItems().subscribe((items: any[]) => {
        this.item = items.find(i => i._id === id);
      });
    }
  }

  addToCart() {
    if (this.item) {
      this.cartService.addToCart(this.item);
      alert(this.translate.instant('item.addedToCart'));
    }
  }
}