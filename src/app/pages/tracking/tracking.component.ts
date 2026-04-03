import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicApiService } from '../../services/public-api.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { interval, Subscription, switchMap, startWith } from 'rxjs';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
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
          <p class="text-large">Total a pagar: <strong>\${{ order.total | number:'1.2-2' }}</strong></p>
          <p class="m-top-20">Recuerda tener listo el efectivo o pago móvil al recibirlo. 🛵</p>
        </div>

        <button routerLink="/" class="btn-primary m-top-20">VOLVER AL INICIO</button>
      </div>

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
    }
    .bg-darker { background-color: #000; }
    .shadow-none { box-shadow: none; border-color: rgba(255,255,255,0.05); }
    
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
  private sub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: PublicApiService,
    private titleService: Title,
    private metaService: Meta
  ) {}

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
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
    }
  }

  getProgress(): number {
    if (!this.order) return 0;
    switch (this.order.status) {
      case 'Recibido': return 20;
      case 'En Cocina': return 50;
      case 'Listo': return 80;
      case 'En Camino': return 90;
      case 'Entregado':
      case 'Pagado': return 100;
      default: return 10;
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
