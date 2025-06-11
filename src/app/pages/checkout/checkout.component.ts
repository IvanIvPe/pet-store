import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  customerName = '';
  address = '';
  phone = '';

  constructor(private cartService: CartService, private orderService: OrderService, private router: Router) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCart();
    this.totalPrice = this.cartService.getTotalPrice();

    if (this.cartItems.length === 0) {
      alert("Your cart is empty!");
      this.router.navigate(['/cart']);
    }
  }

  placeOrder() {
    if (!this.customerName || !this.address || !this.phone) {
      alert("Please fill in all the details.");
      return;
    }

    this.orderService.createOrder({
      customerName: this.customerName,
      address: this.address,
      phone: this.phone,
      items: this.cartItems,
      totalPrice: this.totalPrice,
      status: 'Processing'
    });

    this.cartService.clearCart();
    alert("Order placed successfully!");
    this.router.navigate(['/profile']);
  }
}
