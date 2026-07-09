import { Injectable, computed, signal } from '@angular/core';
import { CartItem, CatalogProductResponse, ProductResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly key = 'urbancore_cart';
  private itemsSignal = signal<CartItem[]>(this.load());

  readonly items = computed(() => this.itemsSignal());
  readonly count = computed(() => this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() => this.itemsSignal().reduce((sum, item) => sum + item.price * item.quantity, 0));

  add(product: CatalogProductResponse | ProductResponse, quantity = 1): void {
    const current = [...this.itemsSignal()];
    const found = current.find(item => item.productId === product.idProduct);

    if (found) {
      found.quantity += quantity;
    } else {
      current.push({
        productId: product.idProduct,
        name: product.name,
        price: Number(product.price),
        quantity,
        imageUrl: product.imageUrl ?? null
      });
    }

    this.save(current);
  }

  updateQuantity(productId: number, quantity: number): void {
    const next = this.itemsSignal()
      .map(item => item.productId === productId ? { ...item, quantity } : item)
      .filter(item => item.quantity > 0);

    this.save(next);
  }

  remove(productId: number): void {
    this.save(this.itemsSignal().filter(item => item.productId !== productId));
  }

  clear(): void {
    this.save([]);
  }

  private save(items: CartItem[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
    this.itemsSignal.set(items);
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]') as CartItem[];
    } catch {
      return [];
    }
  }
}
