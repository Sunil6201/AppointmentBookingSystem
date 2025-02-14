import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerService } from '../../Services/Container.Service';
import { NavbarComponent } from '../navbar/navbar.component'; // Adjust path accordingly

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent], // Include NavbarComponent here
})
export class ContainerComponent implements OnInit {
  containers: any[] = [];
  newContainer = { containerNumber: '', type: '', size: '', status: false };
  selectedContainer: any = null;
  isEditing: boolean = false;
  isModalOpen: boolean = false; // Track modal visibility
  actionType: 'create' | 'update' = 'create'; // Track whether we are creating or updating
  actionsVisible: { [key: number]: boolean } = {}; // Track visibility of dropdown actions for each container

  // Array of container types and sizes
  containerTypes: string[] = [
    'Standard Dry (SD)',
    'Refrigerated (Reefer)',
    'Open Top (OT)',
    'Flat Rack (FR)',
    'Tank (T)',
    'High Cube (HC)',
    'Ventilated (Vent)',
    'Bulk (B)',
    'Mixed Cargo (MC)',
    'Specialized (Spec)'
  ];

  containerSizes: string[] = [
    '20-foot',
    '40-foot',
    '40-foot High Cube',
    '45-foot High Cube',
    '10-foot',
    '30-foot',
    '48-foot',
    '53-foot'
  ];

  constructor(private containerService: ContainerService, private router: Router) {}

  ngOnInit(): void {
    this.getContainers();
  }

  getContainers(): void {
    this.containerService.getAllContainers().subscribe(
      (data) => {
        this.containers = data.filter(container => !container.isDeleted); // Exclude soft-deleted containers
      },
      (error) => {
        console.error('Error fetching containers', error);
        alert('Failed to fetch containers. Please try again later.');
      }
    );
  }

  // Open modal for creating/updating a container
  openModal(action: 'create' | 'update', container?: any): void {
    this.actionType = action;
    this.isModalOpen = true;

    if (action === 'update' && container) {
      this.selectedContainer = container;
      this.newContainer = {
        containerNumber: container.containerNumber,
        type: container.type,
        size: container.size,
        status: container.status
      };
      this.isEditing = true; // Set editing mode
    } else {
      this.resetForm(); // Reset form for creating a new container
    }
  }

  // Close modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  resetForm(): void {
    this.newContainer = { containerNumber: '', type: '', size: '', status: false };
    this.selectedContainer = null;
    this.isEditing = false;
  }

  onSubmit(): void {
    if (this.isEditing) {
      this.updateContainer();
    } else {
      this.createContainer();
    }
  }

  createContainer(): void {
    if (this.newContainer.containerNumber && this.newContainer.type && this.newContainer.size) {
      this.containerService.createContainer(this.newContainer).subscribe(
        () => {
          this.getContainers();
          this.closeModal();
          alert('Container created successfully.');
        },
        (error) => {
          console.error('Error creating container', error);
          alert('Error creating container: ' + error.message);
        }
      );
    } else {
      console.error('Container creation form is invalid:', this.newContainer);
      alert('Please fill out all required fields.');
    }
  }

  updateContainer(): void {
    if (this.selectedContainer) {
      const updatedContainer = {
        id: this.selectedContainer.id,
        containerNumber: this.newContainer.containerNumber,
        type: this.newContainer.type,
        size: this.newContainer.size,
      };

      this.containerService.updateContainer(this.selectedContainer.id, updatedContainer).subscribe(
        () => {
          this.getContainers(); // Refresh the container list after update
          this.closeModal(); // Close modal after successful update
          alert('Container updated successfully.'); // Show success message
        },
        (error) => {
          console.error('Error updating container', error); // Log error if update fails
          alert('Error updating container: ' + error.message); // Show error message
        }
      );
    }
  }

  softDeleteContainer(id: number): void {
    if (confirm('Are you sure you want to delete this container?')) {
      this.containerService.softDeleteContainer(id).subscribe(
        () => {
          this.getContainers();
        },
        (error) => {
          console.error('Error deleting container', error);
          alert('Error deleting container: ' + error.message);
        }
      );
    }
  }

  toggleActions(container: any): void {
    this.actionsVisible[container.id] = !this.actionsVisible[container.id]; // Toggle action visibility for specific container
  }

  isActionsVisible(container: any): boolean {
    return this.actionsVisible[container.id] || false; // Return visibility state for specific container
  }

  getStatusDisplay(status: boolean): string {
    return status ? 'UnAvailable' : 'Available'; // 0: Active, 1: Inactive
  }

  goBack(): void {
    this.router.navigate(['/welcome']); // Navigate back to the previous page
  }
}
