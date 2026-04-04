import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderPersistenceService {
  private readonly STORAGE_KEY = 'cp_active_order_id';

  saveOrderId(id: string) {
    localStorage.setItem(this.STORAGE_KEY, id);
  }

  getActiveOrderId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  clearOrderId() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isOrderActive(status: string): boolean {
    const activeStatuses = ['Recibido', 'En Cocina', 'Listo', 'En Camino'];
    return activeStatuses.includes(status);
  }

  isOrderFinished(status: string): boolean {
    const finishedStatuses = ['Entregado', 'Pagado', 'Cancelado'];
    return finishedStatuses.includes(status);
  }
}
