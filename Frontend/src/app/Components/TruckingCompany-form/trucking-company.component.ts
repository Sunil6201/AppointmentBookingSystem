import { Component, OnInit } from '@angular/core';
import { TruckingCompanyService } from '../../Services/trucking-company.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component'; // Import your NavbarComponent

@Component({
  standalone: true,
  selector: 'app-trucking-company',
  templateUrl: './trucking-company.component.html',
  styleUrls: ['./trucking-company.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent] // Add NavbarComponent to imports
})
export class TruckingCompanyComponent implements OnInit {
  companies: any[] = [];
  company = { id: null, name: '', dropType: '' }; // Include drop type
  isEditing = false;
  showForm = false;
  isModalOpen = false; // Flag to control modal state
  showActions: { [key: number]: boolean } = {}; // Track which row has its actions visible

  constructor(private truckingCompanyService: TruckingCompanyService, private router: Router) {}

  ngOnInit(): void {
    this.fetchCompanies();
  }

  // Fetch all trucking companies
  fetchCompanies(): void {
    this.truckingCompanyService.getAllTruckingCompanies().subscribe(
      (data) => {
        this.companies = data;
        console.log('Fetched companies:', this.companies); // Debugging line
        // Initialize actions visibility for each company
        this.companies.forEach(company => {
          this.showActions[company.id] = false;
        });
      },
      (error) => {
        console.error('Error fetching trucking companies', error);
      }
    );
  }

  // Open modal for creating or updating a trucking company
  openModal(mode: 'create' | 'update', company?: any): void {
    if (mode === 'update' && company) {
      this.company = { ...company }; // Load company data for editing
      this.isEditing = true;
    } else {
      this.resetForm();
      this.isEditing = false;
    }
    this.isModalOpen = true; // Show the modal
  }

  // Create or update a trucking company
  onSubmit(): void {
    if (this.isEditing) {
      this.truckingCompanyService.updateTruckingCompany(this.company).subscribe(
        () => {
          this.fetchCompanies();
          this.closeModal();
          alert('Trucking company updated successfully!');
        },
        (error) => {
          console.error('Error updating trucking company', error);
        }
      );
    } else {
      const companyToCreate = {
        name: this.company.name,
        dropType: this.company.dropType // Include drop type
      };

      this.truckingCompanyService.createTruckingCompany(companyToCreate).subscribe(
        () => {
          this.fetchCompanies();
          this.closeModal();
          alert('Trucking company created successfully!');
        },
        (error) => {
          console.error('Error creating trucking company', error);
        }
      );
    }
  }

  // Soft delete trucking company
  deleteCompany(id: number): void {
    if (confirm('Are you sure you want to delete this trucking company?')) {
      this.truckingCompanyService.softDeleteTruckingCompany(id).subscribe(
        () => {
          this.fetchCompanies();
          alert('Trucking company deleted successfully!');
        },
        (error) => {
          console.error('Error deleting trucking company', error);
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
    this.company = { id: null, name: '', dropType: '' }; // Reset drop type too
    this.isEditing = false;
    this.showForm = false;
  }

  // Show dropdown actions
  toggleActions(companyId: number): void {
    this.showActions[companyId] = !this.showActions[companyId];
  }

  // Check if actions are visible for a specific company
  isActionsVisible(companyId: number): boolean {
    return this.showActions[companyId];
  }

  // Back navigation to the welcome page
  goBack(): void {
    this.router.navigate(['/welcome']); // Navigate to the welcome page
  }
}
