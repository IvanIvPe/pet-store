import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSortModule,
    RouterModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  displayedColumns: string[] = ['image', 'name', 'price', 'status', 'rating', 'actions'];
  ratings: { [id: number]: number } = {};

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.refreshCart();
  }

  cancel(id: number) {
    this.cartService.updateStatus(id, 'canceled');
    this.refreshCart();
  }

  markAsPickedUp(id: number) {
    this.cartService.updateStatus(id, 'received');
    this.refreshCart();
  }

  rate(id: number) {
    const rating = this.ratings[id];
    if (rating >= 1 && rating <= 5) {
      this.cartService.rateItem(id, rating);
      this.refreshCart();
    } else {
      alert("Enter a rating from 1 to 5.");
    }
  }

  removeItem(id: number) {
    this.cartService.removeFromCart(id);
    this.refreshCart();
  }

  clearCart() {
    this.cartService.clearCart();
    this.refreshCart();
  }

  private refreshCart() {
    this.cartItems = this.cartService.getCart();
    this.totalPrice = this.cartService.getTotalPrice();
  }
}
