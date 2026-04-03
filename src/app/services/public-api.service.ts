import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicApiService {
  private apiUrl = 'http://localhost:3000/public';

  constructor(private http: HttpClient) { }

  getConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracion`);
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
}
