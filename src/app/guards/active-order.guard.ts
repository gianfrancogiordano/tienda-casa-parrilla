import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { OrderPersistenceService } from '../services/order-persistence.service';

export const activeOrderGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const persistence = inject(OrderPersistenceService);
  
  const activeId = persistence.getActiveOrderId();
  
  if (activeId) {
    // Si hay un ID guardado, lo mandamos al tracking de ese pedido
    // Evitamos bucle infinito si ya vamos hacia allá (aunque el guard no debería estar en esa ruta)
    if (!state.url.includes(`/pedido/${activeId}`)) {
      router.navigate(['/pedido', activeId]);
      return false;
    }
  }
  
  return true;
};
