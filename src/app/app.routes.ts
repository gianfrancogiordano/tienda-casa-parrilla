import { Routes } from '@angular/router';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { activeOrderGuard } from './guards/active-order.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: CatalogoComponent,
    canActivate: [activeOrderGuard]
  },
  { 
    path: 'carrito', 
    component: CarritoComponent,
    canActivate: [activeOrderGuard]
  },
  { 
    path: 'checkout', 
    component: CheckoutComponent,
    canActivate: [activeOrderGuard]
  },
  { path: 'pedido/:id', component: TrackingComponent },
  { path: '**', redirectTo: '' }
];
