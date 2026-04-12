import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicApiService, RestaurantStatus } from '../../services/public-api.service';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, NavbarComponent, BottomSheetComponent],
  template: `
    <app-navbar></app-navbar>

    <!-- Banner de restaurante cerrado -->
    <div *ngIf="status && !status.isOpen" class="closed-banner">
      <span class="closed-icon">🔴</span>
      <div>
        <strong>Estamos cerrados por ahora</strong>
        <span *ngIf="status.nextOpening"> — Abrimos {{ status.nextOpening }}</span>
      </div>
    </div>
    <main class="container fade-in">
      <section class="banner card overflow-hidden">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <h1 class="text-xl">Casa Parrilla — La Mejor Parrilla en tu Mesa 🍖</h1>
          <p class="text-large">Selecciona tus cortes favoritos y disfruta del sabor real de la brasa.</p>
        </div>
      </section>

      <!-- Categories - Large chips -->
      <div class="categories-wrapper">
        <div class="categories">
          <button 
            *ngFor="let cat of categories" 
            class="cat-chip" 
            [class.active]="selectedCategory === cat"
            (click)="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        <app-product-card 
          *ngFor="let p of filteredProducts()" 
          [product]="p"
          (onAdd)="abrirModal($event)"
        ></app-product-card>
      </div>

      <app-bottom-sheet
        *ngIf="showModal"
        [product]="selectedProduct"
        (onConfirm)="confirmarModal($event)"
        (onClose)="cerrarModal()"
      ></app-bottom-sheet>

      <!-- Skeleton for loading -->
      <div *ngIf="loading" class="products-grid">
        <div class="card skeleton" *ngFor="let i of [1,2,3,4]"></div>
      </div>
    </main>
  `,
  styles: [`
    .container {
      max-width: var(--container-width);
      margin: 0 auto;
      padding: 20px;
    }
    .banner {
      position: relative;
      background-image: url('/assets/banner_parrilla.png');
      background-size: cover;
      background-position: center;
      color: white;
      text-align: center;
      border: none;
      padding: 0;
      min-height: 240px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .banner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%);
      z-index: 1;
    }
    .banner-content {
      position: relative;
      z-index: 2;
      padding: 40px 20px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .overflow-hidden { overflow: hidden; }
    .categories-wrapper {
      margin: 20px -20px;
      overflow-x: auto;
      padding: 0 20px 10px;
      -webkit-overflow-scrolling: touch;
    }
    .categories {
      display: flex;
      gap: 12px;
      width: max-content;
    }
    .cat-chip {
      height: 48px;
      padding: 0 24px;
      background-color: var(--color-surface);
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      white-space: nowrap;
      font-size: 16px;
      border-radius: 24px;
    }
    .cat-chip.active {
      background-color: var(--color-accent);
      color: black;
      font-weight: 700;
      border-color: transparent;
    }
    .products-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-top: 10px;
    }
    .skeleton {
      height: 250px;
      animation: pulse 1.5s infinite ease-in-out;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }
    .closed-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fee2e2;
      color: #991b1b;
      padding: 0.875rem 1.25rem;
      font-size: 0.9rem;
      border-bottom: 2px solid #fca5a5;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .closed-icon { font-size: 1.25rem; }
  `]
})
export class CatalogoComponent implements OnInit {
  products: any[] = [];
  categories: string[] = ['Todos'];
  selectedCategory: string = 'Todos';
  loading: boolean = true;
  status: RestaurantStatus | null = null;

  // Modal State
  showModal: boolean = false;
  selectedProduct: any = null;

  constructor(
    private api: PublicApiService,
    public cart: CartService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Casa Parrilla | Menú de Carnes y Cortes Premium a Domicilio');
    this.metaService.updateTag({ name: 'description', content: 'Disfruta del auténtico sabor de la parrilla en tu mejor momento. Pedidos online de carnes certificadas y cortes especiales. ¡Pide ahora!' });

    // Verificar estado del restaurante
    this.api.status$.subscribe(s => this.status = s);
    this.api.refreshStatus();

    this.api.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        const cats = Array.from(new Set(data.map(p => p.category)));
        this.categories = ['Todos', ...cats.filter(c => !!c)];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filteredProducts() {
    if (this.selectedCategory === 'Todos') return this.products;
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  abrirModal(product: any) {
    this.selectedProduct = product;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.selectedProduct = null;
  }

  confirmarModal(event: { quantity: number; notes: string }) {
    if (this.selectedProduct) {
      this.cart.addToCart(this.selectedProduct, event.quantity, event.notes);
      this.cerrarModal();
      // Optional: scroll to top or show a small toast if available
    }
  }
}
