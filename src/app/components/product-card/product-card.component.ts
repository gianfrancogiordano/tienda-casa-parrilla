import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="onAdd.emit(product)" class="card product-card" [class.not-available]="!product.available">
      <div class="product-image" *ngIf="product.imageUrl">
        <img [src]="product.imageUrl" [alt]="product.name" loading="lazy">
      </div>
      <div class="product-info">
        <h3>{{ product.name }}</h3>
        <p class="description" *ngIf="product.description">{{ product.description }}</p>
        <div class="product-footer">
          <span class="price">{{ api.formatProductPrice(product) }}</span>
          <button class="btn-accent small-btn" (click)="onAdd.emit(product)" [disabled]="!product.available">
            {{ product.available ? 'VER MÁS' : 'NO DISPONIBLE' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease;
      background-color: var(--color-surface);
    }
    .product-card:active { transform: scale(0.98); }
    .product-image {
      height: 180px;
      overflow: hidden;
      background-color: #333;
    }
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .product-info {
      padding: 20px;
    }
    h3 {
      font-size: 20px;
      margin-bottom: 8px;
      color: white;
    }
    .description {
      font-size: 16px;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 48px;
    }
    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price {
      font-size: 24px;
      font-weight: 800;
      color: var(--color-accent);
    }
    .small-btn {
      height: 48px;
      padding: 0 16px;
      font-size: 14px;
      letter-spacing: 1px;
    }
    .not-available {
      opacity: 0.5;
      filter: grayscale(1);
    }
  `]
})
export class ProductCardComponent {
  @Input() product: any;
  @Output() onAdd = new EventEmitter<any>();

  constructor(public api: PublicApiService) { }
}
