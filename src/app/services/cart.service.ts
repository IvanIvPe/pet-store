import { Injectable } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  image: string;
  description: string;
  type: string;
  age: number;
  size: string;
  origin: string;
  price: number;
  status: 'received' | 'in progress' | 'canceled';
  rating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: CartItem[] = [];

  constructor() {
    this.loadCart();
  }

  addToCart(pet: Omit<CartItem, 'status' | 'rating'>) {
    const exists = this.cart.find(p => p.id === pet.id);
    if (exists) return;

    this.cart.push({ ...pet, status: 'in progress' });
    this.saveCart();
  }

  removeFromCart(itemId: number) {
    this.cart = this.cart.filter(item => item.id !== itemId);
    this.saveCart();
  }

  updateStatus(id: number, newStatus: 'received' | 'in progress' | 'canceled') {
    const item = this.cart.find(p => p.id === id);
    if (item) {
      item.status = newStatus;
      this.saveCart();
    }
  }

  rateItem(id: number, rating: number) {
    const item = this.cart.find(p => p.id === id && p.status === 'received');
    if (item) {
      item.rating = rating;
      this.saveCart();
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => total + item.price, 0);
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  private loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }
}
