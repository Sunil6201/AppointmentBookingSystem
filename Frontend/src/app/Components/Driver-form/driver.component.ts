import { Component, OnInit } from '@angular/core';
import { DriverService } from '../../Services/DriverService';
import { AuthService } from '../../Services/auth.services';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component'; // Adjust the path accordingly

@Component({
  standalone: true,
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent] // Include NavbarComponent here
})
export class DriverComponent implements OnInit {
  drivers: any[] = [];
  filteredDrivers: any[] = [];
  driver = { driverName: '', driverMobileNumber: '', licenseNumber: '', vehicleNumber: '', status: false }; // Default status as active
  isEditing = false;
  isModalOpen = false;
  actionsVisible: { [key: number]: boolean } = {};
  searchTerm: string = '';

  constructor(private driverService: DriverService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchDrivers();
  }

  fetchDrivers(): void {
    this.driverService.getAllDrivers().subscribe(
      (data) => {
        this.drivers = data;
        this.filteredDrivers = data;
        this.drivers.forEach(driver => {
          this.actionsVisible[driver.id] = false;
        });
      },
      (error) => {
        console.error('Error fetching drivers', error);
      }
    );
  }

  filterDrivers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredDrivers = this.drivers.filter(driver => 
      driver.driverName.toLowerCase().includes(term) ||
      driver.driverMobileNumber.toLowerCase().includes(term) ||
      driver.licenseNumber.toLowerCase().includes(term) ||
      driver.vehicleNumber.toLowerCase().includes(term)
    );
  }

  openModal(mode: 'create' | 'update', driver?: any): void {
    if (mode === 'update' && driver) {
      this.driver = { ...driver };
      this.isEditing = true;
    } else {
      this.resetForm();
      this.isEditing = false;
    }
    this.isModalOpen = true;
  }

  validateDriverData(): boolean {
    if (this.driver.driverMobileNumber.length !== 10) {
      alert('Mobile number must be exactly 10 digits.');
      return false;
    }
    if (this.driver.licenseNumber.length !== 16) {
      alert('License number must be exactly 16 characters long.');
      return false;
    }
    if (!this.isValidVehicleNumber(this.driver.vehicleNumber)) {
      alert('Vehicle number must be exactly 10 alphanumeric characters.');
      return false;
    }
    return true;
  }

  onSubmit(): void {
    if (!this.validateDriverData()) {
      return; // Stop if validation fails
    }

    if (this.isEditing) {
      this.driverService.updateDriver(this.driver).subscribe(
        (response) => {
          this.fetchDrivers();
          this.closeModal();
          alert('Driver updated successfully!');
        },
        (error) => {
          console.error('Error updating driver:', error);
          alert('Error updating driver. Please check your inputs and try again.');
        }
      );
    } else {
      const driverToCreate = {
        driverName: this.driver.driverName,
        driverMobileNumber: this.driver.driverMobileNumber,
        licenseNumber: this.driver.licenseNumber,
        vehicleNumber: this.driver.vehicleNumber,
        status: this.driver.status // Keep status as is (0 for Active, 1 for Inactive)
      };

      this.driverService.createDriver(driverToCreate).subscribe(
        (response) => {
          this.fetchDrivers();
          this.closeModal();
          alert('Driver created successfully!');
        },
        (error) => {
          console.error('Error creating driver:', error);
          alert('Error creating driver. Please check your inputs and try again.');
        }
      );
    }
  }

  resetForm(): void {
    this.driver = { driverName: '', driverMobileNumber: '', licenseNumber: '', vehicleNumber: '', status: false }; // Reset status to active
    this.isEditing = false;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  softDeleteDriver(driverId: number): void {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.driverService.softDeleteDriver(driverId).subscribe(
        () => {
          this.fetchDrivers();
          alert('Driver deleted successfully!');
        },
        (error) => {
          console.error('Error deleting driver:', error);
        }
      );
    }
  }

  toggleActions(driver: any): void {
    this.actionsVisible[driver.id] = !this.actionsVisible[driver.id];
  }

  isActionsVisible(driver: any): boolean {
    return this.actionsVisible[driver.id];
  }

  getStatusDisplay(status: boolean): string {
    return status ? 'Inactive' : 'Active'; // 0: Active, 1: Inactive
  }

  isValidVehicleNumber(vehicleNumber: string): boolean {
    return /^[A-Za-z0-9]{10}$/.test(vehicleNumber); // Validate vehicle number (10 alphanumeric characters)
  }

  goBack(): void {
    this.router.navigate(['/welcome']);
  }
}
