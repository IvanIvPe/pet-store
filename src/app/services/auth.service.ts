import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private adminUser: User = {
    id: 999, 
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin', 
    role: 'admin'
  };

  private userSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  user$ = this.userSubject.asObservable();

  constructor() {
    this.ensureAdminExists();
  }

  private ensureAdminExists() {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      localStorage.setItem('user', JSON.stringify(this.adminUser));
      this.userSubject.next(this.adminUser);
    }
  }

  login(email: string, password: string): boolean {
    const storedUser = this.getCurrentUser();
    
    if (email === this.adminUser.email && password === this.adminUser.password) {
      localStorage.setItem('user', JSON.stringify(this.adminUser));
      this.userSubject.next(this.adminUser);
      return true;
    }

    if (storedUser && storedUser.email === email && storedUser.password === password) {
      localStorage.setItem('user', JSON.stringify(storedUser));
      this.userSubject.next(storedUser);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  }

  // Funkcija za registraciju
  register(name: string, email: string, password: string): boolean {
    const existingUser = this.getCurrentUser();
    if (existingUser && existingUser.email === email) {
      return false; // korisnik vec postoji
    }

    const newUser: User = {
      id: Math.floor(Math.random() * 1000),
      name,
      email,
      password,
      role: 'user' // svi novi korisnici su "user"
    };

    localStorage.setItem('user', JSON.stringify(newUser));
    this.userSubject.next(newUser);
    return true;
  }

  // Azuriranje korisnickih podataka
  updateUser(updatedUser: User) {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.userSubject.next(updatedUser);
  }

  // Promena lozinke
  changePassword(oldPassword: string, newPassword: string): boolean {
    const user = this.getCurrentUser();
    if (user && user.password === oldPassword) {
      user.password = newPassword;
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  }
}
