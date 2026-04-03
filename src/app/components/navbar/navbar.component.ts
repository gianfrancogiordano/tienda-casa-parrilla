import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <a routerLink="/" class="logo">
          <span class="logo-text">CASA PARRILLA</span>
          <span class="logo-sub">DELIVERY</span>
        </a>
        
        <div class="nav-actions">
          <a routerLink="/carrito" class="cart-btn" [class.has-items]="(cart.items$ | async)?.length">
            <span class="icon">🛒</span>
            <span class="cart-count" *ngIf="cart.getItemCount() > 0">
              {{ cart.getItemCount() }}
            </span>
            <span class="cart-label">PEDIDO</span>
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
      transition: all 0.2s ease;
      position: relative;
    }
    .has-items {
      border-color: var(--color-primary);
      background-color: rgba(192, 57, 43, 0.1);
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
    }
    .icon { font-size: 24px; }
    .cart-label { font-size: 18px; }
  `]
})
export class NavbarComponent {
  constructor(public cart: CartService) {}
}
