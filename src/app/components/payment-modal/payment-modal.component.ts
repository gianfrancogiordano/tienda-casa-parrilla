import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onClose.emit()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="pull-bar"></div>
        
        <div class="modal-header">
          <h2 class="header-text">Formas de Pago 💳</h2>
          <button class="close-btn" (click)="onClose.emit()">✕</button>
        </div>

        <p class="instruction">Realiza tu pago por cualquiera de estos medios y haznos saber una vez esté listo.</p>

        <div class="methods-list">
          <div class="payment-card" *ngFor="let mp of paymentMethods">
            <div class="method-header">
              <span class="method-name">{{ mp.nombre }}</span>
              <span class="logo">{{ mp.logo }}</span>
            </div>
            <div class="method-details">
              <ng-container *ngFor="let det of mp.detalles">
                <p *ngIf="det.tipo === 'p'" [class]="det.class">{{ det.texto }}</p>
                <strong *ngIf="det.tipo === 'strong'" [class]="det.class">{{ det.texto }}</strong>
              </ng-container>
            </div>
          </div>
        </div>

        <button class="btn-primary m-top-20" (click)="onClose.emit()">ENTENDIDO</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: fadeIn 0.18s ease-out;
      will-change: opacity;
    }
    .modal-container {
      width: 100%;
      max-width: var(--container-width);
      background-color: var(--color-surface);
      border-radius: 24px 24px 0 0;
      padding: 12px 24px 40px;
      animation: slideUp 0.28s cubic-bezier(0.32, 1, 0.2, 1);
      box-shadow: 0 -10px 60px rgba(0, 0, 0, 0.6);
      will-change: transform;
      transform: translateZ(0);
      max-height: 90vh;
      overflow-y: auto;
    }
    .pull-bar {
      width: 40px;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      margin: 0 auto 20px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .header-text {
      font-size: 24px;
      font-weight: 800;
      margin: 0;
    }
    .close-btn {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background: rgba(255,255,255,0.1);
      color: white;
      padding: 0;
    }
    .instruction {
      color: var(--color-text-secondary);
      margin-bottom: 24px;
      font-size: 15px;
    }
    .methods-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .payment-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 16px;
    }
    .method-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .method-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-accent);
    }
    .logo { font-size: 20px; }
    .method-details {
      p { color: var(--color-text-secondary); margin-bottom: 4px; font-size: 14px; }
      strong { color: white; display: block; font-size: 17px; margin-bottom: 4px; }
      .pay-id { font-size: 12px; opacity: 0.6; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class PaymentModalComponent {
  @Input() paymentMethods: any[] = [];
  @Output() onClose = new EventEmitter<void>();
}
