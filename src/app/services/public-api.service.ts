import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RestaurantStatus {
  isOpen: boolean;
  nextOpening: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PublicApiService {
  private apiUrl = `${environment.apiUrl}/public`;

  private configSubject = new BehaviorSubject<any>(null);
  config$ = this.configSubject.asObservable();

  private statusSubject = new BehaviorSubject<RestaurantStatus>({ isOpen: true, nextOpening: null });
  status$ = this.statusSubject.asObservable();

  // ─── Currency Selection ────────────────────────────────────────────────────
  private currencySubject = new BehaviorSubject<string>(
    localStorage.getItem('cp_moneda') || 'COP'
  );
  selectedCurrency$ = this.currencySubject.asObservable();

  get selectedCurrency(): string {
    return this.currencySubject.value;
  }

  setCurrency(currency: string): void {
    this.currencySubject.next(currency);
    localStorage.setItem('cp_moneda', currency);
  }

  get currentConfig() {
    return this.configSubject.value;
  }

  get currentStatus(): RestaurantStatus {
    return this.statusSubject.value;
  }

  constructor(private http: HttpClient) {
    this.refreshConfig();
    this.refreshStatus();
  }

  refreshStatus() {
    this.getStatus().subscribe(s => this.statusSubject.next(s));
  }

  refreshConfig() {
    this.getConfig().subscribe(c => this.configSubject.next(c));
  }

  getConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion`).pipe(
      tap(c => this.configSubject.next(c))
    );
  }

  getStatus(): Observable<RestaurantStatus> {
    return this.http.get<RestaurantStatus>(`${this.apiUrl}/status`).pipe(
      tap(s => this.statusSubject.next(s))
    );
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  identifyClient(phone: string, name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/identify`, { phone, name });
  }

  createOrder(orderData: any): Observable<any> {
    const fcmToken = localStorage.getItem('cp_fcm_token');
    const payload = { ...orderData, fcmToken: fcmToken ?? null };
    return this.http.post(`${this.apiUrl}/orders`, payload);
  }

  getOrderStatus(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}`);
  }

  /**
   * Format a product's price using the pre-calculated priceBs/priceCop fields.
   * Falls back to on-the-fly conversion if the product doesn't have those fields yet.
   */
  formatProductPrice(product: any): string {
    const currency = this.selectedCurrency;

    switch (currency) {
      case 'BS':
        if (product.priceBs) {
          return `Bs. ${product.priceBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        // Fallback: calculate from sellPrice
        const config = this.configSubject.value;
        if (config?.tasaCambioUsdBs) {
          const bs = product.sellPrice * config.tasaCambioUsdBs;
          return `Bs. ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return `$${product.sellPrice.toFixed(2)}`;
      case 'COP':
        if (product.priceCop) {
          return `COP$ ${product.priceCop.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
        }
        // Fallback
        const cfg = this.configSubject.value;
        if (cfg?.tasaCambioUsdCop) {
          const cop = Math.ceil((product.sellPrice * cfg.tasaCambioUsdCop) / 1000) * 1000;
          return `COP$ ${cop.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
        }
        return `$${product.sellPrice.toFixed(2)}`;
      default:
        return `$${product.sellPrice.toFixed(2)}`;
    }
  }

  /**
   * Format a raw USD amount using on-the-fly conversion (for totals, cart, etc).
   */
  formatPrice(usdAmount: number): string {
    const currency = this.selectedCurrency;
    const config = this.configSubject.value;
    if (!config) return `$${usdAmount.toFixed(2)}`;

    switch (currency) {
      case 'BS':
        const bs = usdAmount * (config.tasaCambioUsdBs || 1);
        return `Bs. ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'COP':
        // Redondeo para arriba al mil más cercano por el cono monetario de Colombia
        const cop = Math.ceil((usdAmount * (config.tasaCambioUsdCop || 1)) / 1000) * 1000;
        return `COP$ ${cop.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
      default:
        return `$${usdAmount.toFixed(2)}`;
    }
  }

  metodosPago = [
    {
      nombre: 'Bancolombia',
      logo: '🇨🇴',
      detalles: [
        { tipo: 'p', texto: 'Transferencia / Ahorros' },
        { tipo: 'strong', texto: '82428072002' },
        { tipo: 'p', texto: 'Titular: Gianfranco Giordano' }
      ]
    },
    {
      nombre: 'Pago Móvil',
      logo: '🇻🇪',
      detalles: [
        { tipo: 'p', texto: 'Venezuela (0102)' },
        { tipo: 'strong', texto: '04247697244' },
        { tipo: 'p', texto: 'V-17982628' }
      ]
    },
    {
      nombre: 'Binance',
      logo: '🌍',
      detalles: [
        { tipo: 'strong', texto: 'gianfrancogiordano@gmail.com / ggiordano' },
        { tipo: 'p', texto: 'Titular: Gianfranco Giordano' },
        { tipo: 'p', texto: 'ID de Binance: 488344726', class: 'pay-id' }
      ]
    }
  ];
}

