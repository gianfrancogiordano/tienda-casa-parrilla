import { Routes } from '@angular/router';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { TrackingComponent } from './pages/tracking/tracking.component';

export const routes: Routes = [
  { path: '', component: CatalogoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'pedido/:id', component: TrackingComponent },
  { path: '**', redirectTo: '' }
];
