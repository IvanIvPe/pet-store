import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface Pet {
  id: number;
  name: string;
  image: string;
  description: string;
  careGuide: string;
  type: string;
  age: number;
  size: string;
  origin: string;
  price: number;
  reviews: Review[];
}

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private petsSubject = new BehaviorSubject<Pet[]>([]);
  pets$ = this.petsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initPets();
  }

  /** Glavna inicijalizacija */
  private initPets() {
    const savedPets = localStorage.getItem('pets');
  
    if (savedPets) {
      const pets = JSON.parse(savedPets);
      this.petsSubject.next(pets);
    } else {
      this.http.get<Pet[]>('/assets/pets.json').subscribe(pets => {
        this.savePets(pets);
      });
    }
  }
  
  getPets(): Observable<Pet[]> {
    return this.pets$;
  }

  /** Dodavanje novog ljubimca */
  addPet(pet: Pet): void {
    const currentPets = this.petsSubject.getValue();
    pet.id = currentPets.length ? Math.max(...currentPets.map(p => p.id)) + 1 : 1;
    const updatedPets = [...currentPets, pet];
    this.savePets(updatedPets);
  }

  /** Azuriranje ljubimca */
  updatePet(updatedPet: Pet): void {
    const currentPets = this.petsSubject.getValue().map(p => (p.id === updatedPet.id ? updatedPet : p));
    this.savePets(currentPets);
  }

  /** Brisanje ljubimca */
  deletePet(id: number): void {
    const updatedPets = this.petsSubject.getValue().filter(p => p.id !== id);
    this.savePets(updatedPets);
  }

  /** Cuvanje ljubimaca u localStorage i BehaviorSubject */
  private savePets(pets: Pet[]): void {
    localStorage.setItem('pets', JSON.stringify(pets));
    this.petsSubject.next(pets);
  }
/** Osvezavanje liste iz localStorage */
refreshPetsFromStorage(): void {
  const pets = this.loadPets();
  this.petsSubject.next(pets);
}

/** Ucitavanje iz localStorage */
private loadPets(): Pet[] {
  const savedPets = localStorage.getItem('pets');
  return savedPets ? JSON.parse(savedPets) : [];
}  
}
