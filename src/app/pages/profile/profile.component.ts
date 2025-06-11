import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  favoriteTypes?: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User = {
    id: 0,
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    address: '',
    favoriteTypes: []
  };

  allPetTypes: string[] = ['Dog', 'Cat', 'Fish', 'Bird', 'Rabbit', 'Toy'];
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
    }
  }

  saveChanges() {
    if (!this.user.name || !this.user.email) {
      alert("Name and email are required..");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(this.user.email)) {
      alert("Please enter a valid email.");
      return;
    }

    if (!this.user.phone || !this.user.address) {
      alert("Phone and address are required.");
      return;
    }

    this.authService.updateUser(this.user);
    alert("Profile successfully updated!");
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      alert("All password fields are required.");
      return;
    }

    if (this.newPassword.length < 6) {
      alert("The new password must have at least 6 characters.");
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert("The passwords don't match.");
      return;
    }

    const success = this.authService.changePassword(this.oldPassword, this.newPassword);
    if (success) {
      alert("Password successfully changed!");
    } else {
      alert("The old password is incorrect.");
    }
  }
}
