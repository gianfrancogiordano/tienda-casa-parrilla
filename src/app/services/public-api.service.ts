import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicApiService {
  private apiUrl = `${environment.apiUrl}/public`;
  
  private configSubject = new BehaviorSubject<any>(null);
  config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshConfig();
  }

  refreshConfig() {
    this.getConfig().subscribe(c => this.configSubject.next(c));
  }

  getConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion`).pipe(
      tap(c => this.configSubject.next(c))
    );
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  identifyClient(phone: string, name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/identify`, { phone, name });
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData);
  }

  getOrderStatus(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}`);
  }

  formatPrice(usdAmount: number): string {
    const config = this.configSubject.value;
    if (!config) return `$${usdAmount.toFixed(2)}`;

    const moneda = config.monedaDefaultTienda || 'USD';
    
    switch (moneda) {
      case 'BS':
        const bs = usdAmount * (config.tasaCambioUsdBs || 1);
        return `Bs. ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'COP':
        // Redondeo para arriba al mil más cercano por el cono monetario de Colombia
        const cop = Math.ceil((usdAmount * (config.tasaCambioUsdCop || 1)) / 1000) * 1000;
        return `$ ${cop.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
      default:
        return `$${usdAmount.toFixed(2)}`;
    }
  }
}
