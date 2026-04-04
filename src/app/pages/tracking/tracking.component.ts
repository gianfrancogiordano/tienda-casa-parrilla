import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicApiService } from '../../services/public-api.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { OrderPersistenceService } from '../../services/order-persistence.service';
import { interval, Subscription, switchMap, startWith } from 'rxjs';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, PaymentModalComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="container fade-in">
      <div *ngIf="order" class="status-card card">
        <div class="emoji-big">{{ order.emoji }}</div>
        <h1 class="status-text">{{ order.simpleStatus }}</h1>
        <p class="order-number">PEDIDO #{{ order.orderNumber }}</p>
        
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="getProgress()"></div>
        </div>

        <div class="details card shadow-none bg-darker">
          <p class="text-large">Total a pagar: <strong>{{ api.formatPrice(order.total) }}</strong></p>
          <p class="m-top-20">¿Cómo deseas pagar? Tienes nuestros datos disponibles aquí:</p>
          <button (click)="showPaymentModal = true" class="btn-accent small-btn m-top-10">
            VER DATOS DE PAGO 💳
          </button>
          
          <div class="m-top-30" *ngIf="getWhatsAppLink()">
            <p>¿Quieres hacer un cambio en tu pedido?</p>
            <a [href]="getWhatsAppLink()" target="_blank" class="btn-whatsapp small-btn m-top-10">
              CONTACTAR WHATSAPP 📱
            </a>
          </div>
        </div>

        <button routerLink="/" class="btn-primary m-top-20">VOLVER AL INICIO</button>
      </div>

      <app-payment-modal
        *ngIf="showPaymentModal"
        [paymentMethods]="api.metodosPago"
        (onClose)="showPaymentModal = false"
      ></app-payment-modal>

      <div *ngIf="loading && !order" class="status-card card skeleton-status">
        <div class="skeleton-circle"></div>
        <div class="skeleton-line"></div>
      </div>

      <div *ngIf="error" class="card error-card">
        <p class="text-large">No encontramos este pedido.</p>
        <button routerLink="/" class="btn-primary m-top-20">IR AL INICIO</button>
      </div>
    </main>
  `,
  styles: [`
    .container {
      max-width: var(--container-width);
      margin: 0 auto;
      padding: 20px;
    }
    .status-card {
      text-align: center;
      padding: 60px 30px;
      border-top: 8px solid var(--color-primary);
    }
    .emoji-big {
      font-size: 80px;
      margin-bottom: 20px;
      display: block;
    }
    .status-text {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 10px;
      color: white;
    }
    .order-number {
      font-size: 16px;
      letter-spacing: 2px;
      color: var(--color-text-secondary);
      margin-bottom: 40px;
    }
    .progress-bar {
      height: 12px;
      background-color: rgba(255,255,255,0.1);
      border-radius: 6px;
      margin: 20px 0 40px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background-color: var(--color-success);
      transition: width 1s ease;
      box-shadow: 0 0 15px rgba(39, 174, 96, 0.4);
    }
    .details {
      background-color: rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .bg-darker { background-color: #000; }
    .shadow-none { box-shadow: none; border-color: rgba(255,255,255,0.05); }
    .small-btn { 
      height: 52px; 
      padding: 0 32px; 
      font-size: 15px; 
      font-weight: 800; 
      width: auto; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      gap: 8px; 
      border-radius: 26px; /* Pill look */
      letter-spacing: 0.5px;
    }
    .m-top-10 { margin-top: 10px; }
    .m-top-30 { margin-top: 30px; }
    .btn-whatsapp { 
      background-color: #25D366; 
      color: white; 
      border: none; 
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
      transition: all 0.2s ease;
    }
    .btn-whatsapp:hover {
      background-color: #128C7E;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
    }
    
    /* Skeletons */
    .skeleton-status { height: 400px; animation: pulse 1.5s infinite; }
    .skeleton-circle { width: 80px; height: 80px; border-radius: 50%; background: #333; margin: 0 auto 20px; }
    .skeleton-line { height: 30px; width: 60%; background: #333; margin: 0 auto; border-radius: 15px; }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
  `]
})
export class TrackingComponent implements OnInit, OnDestroy {
  order: any = null;
  loading = true;
  error = false;
  showPaymentModal = false;
  private sub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    public api: PublicApiService,
    private persistence: OrderPersistenceService,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Sigue tu Pedido | Casa Parrilla');
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sub = interval(15000).pipe(
        startWith(0),
        switchMap(() => this.api.getOrderStatus(id))
      ).subscribe({
        next: (data) => {
          this.order = data;
          this.loading = false;
          
          // Si el pedido terminó, liberamos al cliente
          if (this.persistence.isOrderFinished(data.status)) {
            this.persistence.clearOrderId();
          }
        },
        error: () => {
          this.error = true;
          this.loading = false;
          // Si el pedido no existe, limpiamos por si acaso
          this.persistence.clearOrderId();
        }
      });
    }
  }

  getProgress(): number {
    if (!this.order) return 0;
    switch (this.order.status) {
      case 'Recibido': return 20;
      case 'En Cocina': return 50;
      case 'Lista': return 80;
      case 'En Camino': return 90;
      case 'Entregado':
      case 'Pagado': return 100;
      default: return 10;
    }
  }

  getWhatsAppLink(): string {
    const currentConfig = this.api.currentConfig;
    if (!this.order || !currentConfig?.telefono) return '';

    const phone = currentConfig.telefono.replace(/\D/g, '');
    const orderNum = this.order.orderNumber || this.order._id;
    const clientName = this.order.client?.name || this.order.customerName || 'Cliente';

    const message = `Hola, quiero información sobre mi pedido n° ${orderNum} y mi nombre es: ${clientName}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
