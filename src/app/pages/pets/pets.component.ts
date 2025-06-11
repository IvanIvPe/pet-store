import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PetService, Pet } from '../../services/pet.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.css']
})
export class PetsComponent implements OnInit {
  pets: Pet[] = [];
  filteredPets: Pet[] = [];
  petTypes: string[] = [];
  searchName: string = '';
  selectedType: string = '';
  maxPrice: number | null = null;
  selectedSize: string = '';
  minAge: number | null = null;
  maxAge: number | null = null;
  selectedOrigin: string = '';
  minRating: number | null = null;


  constructor(
    private petService: PetService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPets();
    console.log('PetsComponent pokrenut');

  }

  /** Osvezavanje liste ljubimaca */
  loadPets() {
    this.petService.getPets().subscribe(pets => {
      this.pets = pets;
      this.petTypes = this.getUniquePetTypes();
      this.filterPets();
    });    
  }

  /** Filtriranje ljubimaca */
  filterPets() {
    this.filteredPets = this.pets.filter(pet =>
      (!this.searchName || pet.name.toLowerCase().includes(this.searchName.toLowerCase())) &&
      (!this.selectedType || pet.type === this.selectedType) &&
      (!this.selectedSize || pet.size === this.selectedSize) &&
      (!this.minAge || pet.age >= this.minAge) &&
      (!this.maxAge || pet.age <= this.maxAge) &&
      (!this.selectedOrigin || pet.origin === this.selectedOrigin) &&
      (!this.maxPrice || pet.price <= this.maxPrice) &&
      (!this.minRating || this.getAverageRating(pet.reviews) >= this.minRating)
    );
  }
  

  /** Dobijanje unikatnih tipova ljubimaca */
  getUniquePetTypes(): string[] {
    return [...new Set(this.pets.map(pet => pet.type))];
  }

  /** Navigacija na detalje ljubimca */
  goToDetails(petId: number) {
    this.router.navigate(['/pet-details', petId]);
  }

  /** Dodavanje ljubimca u korpu */
  addToCart(pet: Pet) {
    this.cartService.addToCart(pet);
    alert(`${pet.name} je dodat u korpu!`);
  }

  getAverageRating(reviews: { rating: number }[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
  }

  getUniqueOrigins(): string[] {
    return [...new Set(this.pets.map(pet => pet.origin))];
  }
  
  getUniqueSizes(): string[] {
    return [...new Set(this.pets.map(pet => pet.size))];
  }  
  
}
