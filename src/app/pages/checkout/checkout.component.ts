import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ClientSessionService } from '../../services/client-session.service';
import { PublicApiService, RestaurantStatus } from '../../services/public-api.service';
import { OrderPersistenceService } from '../../services/order-persistence.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  step = 1;
  loading = false;
  config: any = null;
  status: RestaurantStatus | null = null;
  errorMsg = '';

  nameForm = { phone: '', name: '' };
  addressForm = { address: '', notes: '' };

  constructor(
    public cart: CartService,
    public session: ClientSessionService,
    public api: PublicApiService,
    private persistence: OrderPersistenceService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Finalizar Pedido | Casa Parrilla');
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    if (this.cart.getItemCount() === 0) {
      this.router.navigate(['/']);
    }

    // Verificar si el restaurante está abierto
    this.api.status$.subscribe(s => this.status = s);
    this.api.refreshStatus();

    // Cargar tasas de cambio
    this.api.getConfig().subscribe({
      next: (data) => {
        this.config = data;
      },
      error: (err) => console.error('Error cargando tasas:', err)
    });

    // Si ya inició sesión, saltar al paso 2
    this.session.client$.subscribe(c => {
      if (c && this.step === 1) {
        this.nameForm = { phone: c.phone, name: c.name };
        this.step = 2;
      }
    });
  }

  get totalBs(): number {
    if (!this.config || !this.config.tasaCambioUsdBs) return 0;
    return this.cart.getTotal() * this.config.tasaCambioUsdBs;
  }

  get totalCop(): number {
    if (!this.config || !this.config.tasaCambioUsdCop) return 0;
    const base = this.cart.getTotal() * this.config.tasaCambioUsdCop;
    return Math.ceil(base / 1000) * 1000;
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
    // Verificación del lado del cliente
    if (this.status && !this.status.isOpen) {
      this.errorMsg = this.status.nextOpening
        ? `El restaurante está cerrado. Abrimos ${this.status.nextOpening}.`
        : 'El restaurante está cerrado por hoy.';
      return;
    }

    const client = this.session.currentClient;
    const items = this.cart.currentItems;

    if (!client || items.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.loading = true;
    this.errorMsg = '';

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
        this.persistence.saveOrderId(res._id);
        this.router.navigate(['/pedido', res._id]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.errorMsg = err.error?.message || 'El restaurante está cerrado en este momento.';
        } else {
          this.errorMsg = 'Hubo un error al enviar tu pedido. Intenta de nuevo.';
        }
      }
    });
  }

  get metodosPago() {
    return this.api.metodosPago;
  }
}
