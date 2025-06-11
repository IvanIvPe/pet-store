import { Injectable } from '@angular/core';

interface Order {
  id: number;
  customerName: string;
  address: string;
  phone: string;
  items: any[];
  totalPrice: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: Order[] = [];

  constructor() {
    this.loadOrders();
  }

  createOrder(order: Omit<Order, 'id'>) {
    const newOrder = { id: Date.now(), ...order };
    this.orders.push(newOrder);
    this.saveOrders();
  }

  getOrders(): Order[] {
    return this.orders;
  }

  private saveOrders() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }

  private loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
    }
  }
}
