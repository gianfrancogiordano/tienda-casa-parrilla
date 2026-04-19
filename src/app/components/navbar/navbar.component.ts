import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <a routerLink="/" class="logo">
          <span class="logo-text">CASA PARRILLA</span>
          <span class="logo-sub">DELIVERY</span>
        </a>
        
        <div class="nav-actions">
          <!-- Currency Selector -->
          <select class="currency-select"
                  [ngModel]="api.selectedCurrency"
                  (ngModelChange)="onCurrencyChange($event)">
            <option value="COP">🇨🇴 COP</option>
            <option value="USD">🇺🇸 USD</option>
            <option value="BS">🇻🇪 Bs</option>
          </select>

          <a routerLink="/carrito" class="cart-btn" [class.has-items]="(cart.items$ | async)?.length">
            <span class="icon">🛒</span>
            <span class="cart-count" *ngIf="cart.getItemCount() > 0">
              {{ cart.getItemCount() }}
            </span>
            <div class="cart-label">
              <span class="label-top">MI PEDIDO</span>
              <span class="label-amount">{{ api.formatPrice(cart.getTotal()) }}</span>
            </div>
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: 80px;
      background-color: rgba(17, 17, 17, 0.8);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .nav-content {
      max-width: var(--container-width);
      margin: 0 auto;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }
    .logo {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .logo-text {
      color: var(--color-primary);
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .logo-sub {
      color: var(--color-accent);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .currency-select {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: white;
      font-weight: 700;
      font-size: 13px;
      padding: 8px 12px;
      border-radius: 20px;
      cursor: pointer;
      outline: none;
      transition: all 0.2s;
      -webkit-appearance: none;
      appearance: none;
      letter-spacing: 0.5px;
    }
    .currency-select:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .currency-select:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px rgba(243, 156, 18, 0.3);
    }
    .currency-select option {
      background: #1a1a1a;
      color: white;
    }
    .cart-btn {
      text-decoration: none;
      background-color: var(--color-surface);
      height: 56px;
      padding: 0 20px;
      border-radius: 28px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
      font-weight: 700;
      border: 2px solid transparent;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &:hover {
        transform: scale(1.05) rotate(-1deg);
        background-color: var(--color-primary);
        box-shadow: 0 8px 25px rgba(192, 57, 43, 0.4);
      }

      &:active {
        transform: scale(0.95);
      }
    }
    .has-items {
      border-color: var(--color-primary);
      background-color: rgba(192, 57, 43, 0.1);
      animation: pulse-cart 2s infinite;
    }
    .cart-count {
      background-color: var(--color-primary);
      color: white;
      font-size: 14px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      position: absolute;
      top: -5px;
      left: -5px;
      box-shadow: 0 4px 10px rgba(192, 57, 43, 0.4);
      z-index: 2;
    }
    .icon { font-size: 24px; }
    .cart-label { 
      display: flex; 
      flex-direction: column; 
      align-items: flex-start;
      line-height: 1.1; 
    }
    .label-top {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      opacity: 0.8;
      text-transform: uppercase;
    }
    .label-amount {
      font-size: 18px;
      font-weight: 800;
      color: white;
    }

    @keyframes pulse-cart {
      0% {
        box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.4);
      }
      70% {
        box-shadow: 0 0 0 15px rgba(192, 57, 43, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(192, 57, 43, 0);
      }
    }

    /* ─── Mobile ─────────────────────────── */
    @media (max-width: 480px) {
      .navbar {
        height: 60px;
      }
      .nav-content {
        padding: 0 12px;
      }
      .logo-text {
        font-size: 16px;
      }
      .logo-sub {
        font-size: 10px;
        letter-spacing: 1.5px;
      }
      .nav-actions {
        gap: 8px;
      }
      .currency-select {
        font-size: 11px;
        padding: 6px 8px;
        border-radius: 16px;
      }
      .cart-btn {
        height: 42px;
        padding: 0 12px;
        gap: 6px;
        border-radius: 21px;
      }
      .icon {
        font-size: 18px;
      }
      .label-top {
        display: none;
      }
      .label-amount {
        font-size: 13px;
      }
      .cart-count {
        width: 18px;
        height: 18px;
        font-size: 11px;
        top: -4px;
        left: -4px;
      }
    }
  `]
})
export class NavbarComponent {
  constructor(
    public cart: CartService,
    public api: PublicApiService
  ) {}

  onCurrencyChange(currency: string): void {
    this.api.setCurrency(currency);
  }
}

