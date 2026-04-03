import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { PublicApiService } from './public-api.service';

export interface ClientData {
  clientId: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  isVip: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientSessionService {
  private clientSubject = new BehaviorSubject<ClientData | null>(null);
  client$ = this.clientSubject.asObservable();

  get currentClient(): ClientData | null {
    return this.clientSubject.value;
  }

  constructor(private publicApi: PublicApiService) {
    this.loadSession();
  }

  private loadSession() {
    const saved = sessionStorage.getItem('cp_client');
    if (saved) {
      try {
        this.clientSubject.next(JSON.parse(saved));
      } catch (e) {
        sessionStorage.removeItem('cp_client');
      }
    }
  }

  identify(phone: string, name: string) {
    return this.publicApi.identifyClient(phone, name).pipe(
      tap(data => {
        const clientData: ClientData = {
          clientId: data.clientId,
          name: data.name,
          phone: phone,
          loyaltyPoints: data.loyaltyPoints,
          isVip: data.isVip
        };
        this.clientSubject.next(clientData);
        sessionStorage.setItem('cp_client', JSON.stringify(clientData));
      })
    );
  }

  logout() {
    this.clientSubject.next(null);
    sessionStorage.removeItem('cp_client');
  }

  isLoggedIn(): boolean {
    return !!this.clientSubject.value;
  }
}
