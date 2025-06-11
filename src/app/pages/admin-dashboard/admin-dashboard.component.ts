import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { PetService, Pet } from '../../services/pet.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  pets: Pet[] = [];
  isEditing = false;

  pet: Pet = {
    id: 0,
    name: '',
    image: '',
    description: '',
    careGuide: '',
    type: '',
    age: 0,
    size: '',
    origin: '',
    price: 0,
    reviews: []
  };

  constructor(private petService: PetService) {}

  ngOnInit() {
    this.loadPets();
  }

  loadPets() {
    this.petService.getPets().subscribe(pets => {
      this.pets = pets;
    });
  }

  addPet() {
    if (!this.pet.name || !this.pet.image || !this.pet.description || !this.pet.type || !this.pet.price || !this.pet.careGuide || !this.pet.origin) {
      alert('Molimo popunite sva polja!');
      return;
    }

    this.petService.addPet(this.pet);
    this.petService.refreshPetsFromStorage(); // 🔁 dodato
    this.loadPets();
    this.resetForm();
  }

  editPet(pet: Pet) {
    this.pet = { ...pet };
    this.isEditing = true;
  }

  updatePet() {
    this.petService.updatePet(this.pet);
    this.petService.refreshPetsFromStorage(); // 🔁 dodato
    this.loadPets();
    this.resetForm();
  }

  deletePet(petId: number) {
    this.petService.deletePet(petId);
    this.petService.refreshPetsFromStorage(); // 🔁 dodato
    this.loadPets();
  }

  resetForm() {
    this.pet = {
      id: 0,
      name: '',
      image: '',
      description: '',
      careGuide: '',
      type: '',
      age: 0,
      size: '',
      origin: '',
      price: 0,
      reviews: []
    };
    this.isEditing = false;
  }
}
