import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string;
  requiresKitchen?: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  get currentItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const saved = localStorage.getItem('cp_cart');
    if (saved) {
      try {
        this.itemsSubject.next(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('cp_cart');
      }
    }
  }

  private saveCart() {
    localStorage.setItem('cp_cart', JSON.stringify(this.itemsSubject.value));
  }

  addToCart(product: any, quantity: number = 1, notes: string = '') {
    const currentItems = this.itemsSubject.value;
    
    // Buscar si ya existe el mismo producto CON LA MISMA NOTA
    const existing = currentItems.find(i => 
      i.productId === product._id && (i.notes ?? '') === (notes ?? '')
    );

    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = existing.quantity * existing.unitPrice;
      this.itemsSubject.next([...currentItems]);
    } else {
      const newItem: CartItem = {
        productId: product._id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.sellPrice,
        subtotal: product.sellPrice * quantity,
        imageUrl: product.imageUrl,
        requiresKitchen: product.requiresKitchen ?? true,
        notes: notes
      };
      this.itemsSubject.next([...currentItems, newItem]);
    }
    this.saveCart();
  }

  removeFromCart(productId: string) {
    const currentItems = this.itemsSubject.value.filter(i => i.productId !== productId);
    this.itemsSubject.next(currentItems);
    this.saveCart();
  }

  updateQuantity(productId: string, delta: number) {
    const currentItems = this.itemsSubject.value;
    const item = currentItems.find(i => i.productId === productId);
    
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.subtotal = item.quantity * item.unitPrice;
        this.itemsSubject.next([...currentItems]);
        this.saveCart();
      }
    }
  }

  getTotal(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.subtotal, 0);
  }

  clearCart() {
    this.itemsSubject.next([]);
    localStorage.removeItem('cp_cart');
  }

  getItemCount(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.quantity, 0);
  }
}
