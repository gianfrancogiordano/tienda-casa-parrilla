import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ClientSessionService } from '../../services/client-session.service';
import { PublicApiService } from '../../services/public-api.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="container fade-in">
      <div class="step-indicator">PASO {{ step }} DE 3</div>
      
      <!-- STEP 1: Identification -->
      <section *ngIf="step === 1" class="card">
        <h1 class="header-text">¿Quién recibe? 👤</h1>
        <p class="instruction">Dinos tu nombre y teléfono para encontrarte.</p>
        
        <div class="m-bottom-20">
          <label>TU TELÉFONO</label>
          <input 
            type="tel" 
            [(ngModel)]="nameForm.phone" 
            placeholder="Ej: 0414-1234567"
            class="large-input"
          >
        </div>

        <div class="m-bottom-20" *ngIf="nameForm.phone.length > 5">
          <label>TU NOMBRE</label>
          <input 
            type="text" 
            [(ngModel)]="nameForm.name" 
            placeholder="Como quieres que te llamemos"
            class="large-input"
          >
        </div>

        <button 
          (click)="identify()" 
          class="btn-primary" 
          [disabled]="!nameForm.phone || !nameForm.name || loading"
        >
          {{ loading ? 'BUSCANDO...' : 'SIGUIENTE PASO' }}
        </button>
      </section>

      <!-- STEP 2: Address -->
      <section *ngIf="step === 2" class="card">
        <span *ngIf="session.client$ | async as c" class="vip-welcome">
          ¡Hola de nuevo, {{ c.name }}! 👋
          <span *ngIf="c.isVip" class="vip-badge">TIENES {{ c.loyaltyPoints }} PUNTOS VIP</span>
        </span>
        
        <h1 class="header-text">¿A dónde lo llevamos? 🛵</h1>
        
        <div class="m-bottom-20">
          <label>DIRECCIÓN EXACTA</label>
          <textarea 
            [(ngModel)]="addressForm.address" 
            placeholder="Ej: Calle 5, Edificio Sol, Apto 4B"
            class="large-input"
          ></textarea>
        </div>

        <div class="m-bottom-20">
          <label>NOTAS (OPCIONAL)</label>
          <textarea 
            [(ngModel)]="addressForm.notes" 
            placeholder="Ej: El timbre no funciona, llámame"
            class="large-input"
          ></textarea>
        </div>

        <button 
          (click)="nextStep()" 
          class="btn-primary" 
          [disabled]="!addressForm.address"
        >
          REVISAR PEDIDO
        </button>
        <button (click)="step = 1" class="btn-text">← VOLVER ATRÁS</button>
      </section>

      <!-- STEP 3: Confirm -->
      <section *ngIf="step === 3" class="card">
        <h1 class="header-text">¿Todo está bien? ✅</h1>
        
        <div class="review-row">
          <span class="label">Para:</span>
          <span class="val">{{ nameForm.name }} ({{ nameForm.phone }})</span>
        </div>
        <div class="review-row">
          <span class="label">Destino:</span>
          <span class="val">{{ addressForm.address }}</span>
        </div>
        <div class="review-row">
          <span class="label">Total a pagar:</span>
          <span class="val total">\${{ cart.getTotal() | number:'1.2-2' }}</span>
        </div>

        <button (click)="confirmOrder()" class="btn-primary confirm-btn" [disabled]="loading">
          {{ loading ? 'ENVIANDO...' : '¡SI, PEDIR AHORA! 🍖' }}
        </button>
        <button (click)="step = 2" class="btn-text" *ngIf="!loading">← HACER CAMBIOS</button>
      </section>
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
      margin-bottom: 10px;
    }
    .step-indicator {
      text-align: center;
      font-weight: 800;
      color: var(--color-accent);
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    .instruction {
      font-size: 18px;
      color: var(--color-text-secondary);
      margin-bottom: 30px;
    }
    .vip-welcome {
      display: block;
      background-color: rgba(245, 166, 35, 0.1);
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-weight: 700;
      color: var(--color-accent);
    }
    .vip-badge {
      display: block;
      font-size: 14px;
      margin-top: 5px;
    }
    .btn-text {
      background: none;
      color: var(--color-text-secondary);
      width: 100%;
      margin-top: 15px;
      height: 48px;
    }
    .review-row {
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .review-row .label {
      display: block;
      font-size: 14px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .review-row .val {
      font-size: 20px;
      font-weight: 600;
    }
    .val.total {
      font-size: 32px;
      color: var(--color-success);
    }
    .confirm-btn {
      height: 80px;
      font-size: 24px;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  step = 1;
  loading = false;
  
  nameForm = { phone: '', name: '' };
  addressForm = { address: '', notes: '' };

  constructor(
    public cart: CartService,
    public session: ClientSessionService,
    private api: PublicApiService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Finalizar Pedido | Casa Parrilla');
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    if (this.cart.getItemCount() === 0) {
      this.router.navigate(['/']);
    }
    
    // Si ya inició sesión, saltar al paso 2
    this.session.client$.subscribe(c => {
      if (c && this.step === 1) {
        this.nameForm = { phone: c.phone, name: c.name };
        this.step = 2;
      }
    });
  }

  identify() {
    this.loading = true;
    this.session.identify(this.nameForm.phone, this.nameForm.name).subscribe({
      next: () => {
        this.loading = false;
        this.step = 2;
      },
      error: () => this.loading = false
    });
  }

  nextStep() {
    this.step = 3;
    window.scrollTo(0, 0);
  }

  confirmOrder() {
    const client = this.session.currentClient;
    const items = this.cart.currentItems;

    if (!client || items.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.loading = true;

    const orderData = {
      clientId: client.clientId,
      customerPhone: client.phone,
      deliveryAddress: this.addressForm.address,
      deliveryNotes: this.addressForm.notes,
      items: items,
      paymentMethod: 'Efectivo'
    };

    this.api.createOrder(orderData).subscribe({
      next: (res) => {
        this.cart.clearCart();
        this.router.navigate(['/pedido', res._id]);
      },
      error: (err) => {
        console.error('Error al crear pedido:', err);
        this.loading = false;
        // Podríamos agregar un SweetAlert aquí luego
      }
    });
  }
}
