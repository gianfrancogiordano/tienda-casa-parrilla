import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="container fade-in">
      <h1 class="header-text">Tu Pedido 📝</h1>

      <div *ngIf="cart.getItemCount() === 0" class="empty-cart card">
        <p class="text-large">Aún no has agregado nada.</p>
        <button routerLink="/" class="btn-primary m-top-20">VER EL MENÚ</button>
      </div>

      <div *ngIf="cart.getItemCount() > 0">
        <!-- Item List -->
        <div class="card item-card" *ngFor="let item of cart.items$ | async">
          <div class="item-header">
            <h3>{{ item.productName }}</h3>
            <span class="item-subtotal">{{ api.formatPrice(item.subtotal) }}</span>
          </div>
          
          <div class="item-controls">
            <div class="quantity-picker">
              <button class="q-btn btn-minus" (click)="cart.updateQuantity(item.productId, -1)">−</button>
              <span class="quantity-num">{{ item.quantity }}</span>
              <button class="q-btn btn-plus" (click)="cart.updateQuantity(item.productId, 1)">+</button>
            </div>
            <button class="remove-link" (click)="cart.removeFromCart(item.productId)">QUITAR</button>
          </div>
        </div>

        <!-- Summary -->
        <div class="card summary-card">
          <div class="total-row">
            <span class="total-label">Total a pagar:</span>
            <span class="total-value">{{ api.formatPrice(cart.getTotal()) }}</span>
          </div>
          <p class="payment-note">Pagas al recibir tu pedido 🛵</p>
          
          <button routerLink="/checkout" class="btn-primary confirm-btn">
            CONTINUAR AL PAGO
          </button>
          <button routerLink="/" class="btn-secondary m-top-20">
            AGREGAR MÁS PLATOS
          </button>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .container {
      max-width: var(--container-width);
      margin: 0 auto;
      padding: 20px;
    }
    .header-text {
      font-size: var(--font-size-xl);
      text-align: center;
      margin: 20px 0;
    }
    .empty-cart {
      text-align: center;
      padding: 60px 20px;
    }
    .item-card {
      margin-bottom: 12px;
      padding: 20px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h3 { font-size: 20px; }
    .item-subtotal {
      font-size: 22px;
      font-weight: 800;
      color: var(--color-accent);
    }
    .item-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .quantity-picker {
      display: flex;
      align-items: center;
      background-color: rgba(255,255,255,0.05);
      border-radius: 40px;
      padding: 4px;
    }
    .q-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      padding: 0;
      font-size: 24px;
      background-color: var(--color-surface);
      border: 2px solid rgba(255,255,255,0.1);
      color: white;
    }
    .btn-plus { border-color: var(--color-primary); color: var(--color-primary); }
    .quantity-num {
      margin: 0 20px;
      font-size: 24px;
      font-weight: 700;
      min-width: 30px;
      text-align: center;
    }
    .remove-link {
      background: none;
      color: #FF5252;
      font-size: 14px;
      font-weight: 700;
      height: auto;
      padding: 10px;
      letter-spacing: 1px;
    }
    .summary-card {
      margin-top: 30px;
      border-top: 4px solid var(--color-primary);
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .total-label { font-size: 20px; font-weight: 600; }
    .total-value { font-size: 32px; font-weight: 800; color: var(--color-success); }
    .payment-note {
      text-align: center;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
      font-style: italic;
    }
    .confirm-btn {
      height: 72px;
      font-size: 20px;
    }
    .btn-secondary {
      background: none;
      border: 2px solid var(--color-text-secondary);
      color: var(--color-text-secondary);
      width: 100%;
    }
  `]
})
export class CarritoComponent implements OnInit {
  constructor(
    public cart: CartService,
    public api: PublicApiService,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Mi Carrito | Casa Parrilla');
  }
}
