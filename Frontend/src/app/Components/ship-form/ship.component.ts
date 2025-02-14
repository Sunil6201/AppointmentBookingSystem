import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth.services';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShipService } from '../../Services/ship.service';
import { NavbarComponent } from '../navbar/navbar.component'; // Import NavbarComponent

@Component({
  standalone: true,
  selector: 'app-ship',
  templateUrl: './ship.component.html',
  styleUrls: ['./ship.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent] // Add NavbarComponent here
})
export class ShipComponent implements OnInit {
  ships: any[] = [];
  filteredShips: any[] = []; // Store filtered ships
  ship = { shipNumber: '', timeSlot: '', isDeleted: false, status: false }; // Removed id, following your API model
  isEditing = false;
  isModalOpen = false; // To track modal visibility
  actionsVisible: { [key: number]: boolean } = {};
  searchTerm: string = ''; // Search term for filtering

  constructor(private shipService: ShipService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchShips();
  }

  // Fetch all ships
  fetchShips(): void {
    this.shipService.getShips().subscribe(
      (data) => {
        this.ships = data;
        this.filteredShips = data; // Initialize filtered ships with all ships
        this.ships.forEach(ship => {
          this.actionsVisible[ship.id] = false;
        });
      },
      (error) => {
        console.error('Error fetching ships', error);
      }
    );
  }

  // Filter ships based on the search term when the search button is clicked
  filterShips(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredShips = this.ships.filter(ship => 
      ship.shipNumber.toLowerCase().includes(term) ||
      ship.timeSlot.toString().toLowerCase().includes(term)
    );
  }

  // Open modal for creating or updating a ship
  openModal(mode: 'create' | 'update', ship?: any): void {
    if (mode === 'update' && ship) {
      this.ship = { ...ship }; // Load ship data for editing
      this.isEditing = true;
    } else {
      this.resetForm();
      this.isEditing = false;
    }
    this.isModalOpen = true; // Show the modal
  }

  // Create or update a ship
  onSubmit(): void {
    if (this.isEditing) {
      this.shipService.updateShip(this.ship).subscribe(
        () => {
          this.fetchShips();
          this.closeModal();
          alert('Ship updated successfully!'); // Success message
        },
        (error) => {
          console.error('Error updating ship', error);
        }
      );
    } else {
      const shipToCreate = {
        shipNumber: this.ship.shipNumber,
        timeSlot: this.ship.timeSlot,
        isDeleted: false
      };

      this.shipService.createShip(shipToCreate).subscribe(
        () => {
          this.fetchShips();
          this.closeModal();
          alert('Ship created successfully!'); // Success message
        },
        (error) => {
          console.error('Error creating ship', error);
        }
      );
    }
  }

  // Soft delete ship
  softDeleteShip(id: number): void {
    if (confirm('Are you sure you want to delete this ship?')) {
      this.shipService.softDeleteShip(id).subscribe(
        () => {
          this.fetchShips(); // Refresh the ship list after deletion
        },
        (error) => {
          console.error('Error deleting ship', error);
        }
      );
    }
  }

  // Close the modal
  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm(); // Reset form when closing
  }

  // Reset form
  resetForm(): void {
    this.ship = { shipNumber: '', timeSlot: '', isDeleted: false, status: false };
  }

  // Toggle actions for a specific ship
  toggleActions(ship: any): void {
    this.actionsVisible[ship.id] = !this.actionsVisible[ship.id]; // Toggle action visibility
  }

  // Check if actions are visible for a specific ship
  isActionsVisible(ship: any): boolean {
    return this.actionsVisible[ship.id]; // Return visibility state
  }
  
  getStatusDisplay(status: boolean): string {
    return status ? 'UnAvailable' : 'Available'; // 0: Active, 1: Inactive
  }

  // Navigate back to the previous page
  goBack(): void {
    this.router.navigate(['/welcome']);
  }
}
