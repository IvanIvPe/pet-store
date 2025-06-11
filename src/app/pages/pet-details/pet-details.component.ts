import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../services/cart.service';
import { PetService, Pet } from '../../services/pet.service';

@Component({
  selector: 'app-pet-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './pet-details.component.html',
  styleUrls: ['./pet-details.component.css']
})
export class PetDetailsComponent implements OnInit {
  pet: Pet | undefined;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private petService: PetService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.petService.getPets().subscribe(pets => {
      this.pet = pets.find(p => p.id === id);
    });
  }

  addToCart() {
    if (this.pet) {
      this.cartService.addToCart(this.pet);
      alert(`${this.pet.name} was added to cart!`);
    }
  }
}
