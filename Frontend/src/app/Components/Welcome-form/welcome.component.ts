// src/app/Components/Welcome-form/welcome.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.services';
import { AppointmentListComponent } from '../appointment-list/appointment-list.component'; // Import the AppointmentListComponent
import { NavbarComponent } from '../navbar/navbar.component'; // Ensure you import the NavbarComponent

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  standalone: true,
  imports: [CommonModule, AppointmentListComponent, NavbarComponent], // Add NavbarComponent to imports
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {
  username: string | null = null;
  role: string | null = null;

  // Statistics data
  stats = [
    { target: 85, value: 0, label: 'Global Port Authorities' },
    { target: 200, value: 0, label: 'Inland Depots' },
    { target: 310000, value: 0, label: 'Active Monthly Users' },
    { target: 250, value: 0, label: 'Million Monthly Cargo Transactions Processed' }
  ];

  constructor(private router: Router, private authService: AuthService) {
    if (this.isLoggedIn()) {
      this.username = this.authService.getUsername();
      this.role = this.authService.getRole();
    }
  }

  ngOnInit(): void {
    this.animateStats(); // Start animating stats on initialization
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Navigation methods
  navigateToBooking() {
    this.router.navigate(['/book-appointment']);
  }

  navigateToDrivers() {
    this.router.navigate(['/drivers']);
  }

  navigateToTerminals() {
    this.router.navigate(['/terminals']);
  }

  navigateToContainers() {
    this.router.navigate(['/containers']);
  }

  navigateToTruckingCompanies() {
    this.router.navigate(['/trucking-companies']);
  }

  navigateToAppointments() {
    this.router.navigate(['/appointments']);
  }

  navigateToShip() {
    this.router.navigate(['/ships']);
  }

  // Method to animate statistics
  animateStats() {
    const duration = 2000; // 7 seconds
    const interval = duration / this.stats.length; // Time per stat

    this.stats.forEach(stat => {
      const increment = Math.ceil(stat.target / (duration / 20)); // Increment value
      const updateValue = () => {
        if (stat.value < stat.target) {
          stat.value += increment;
          if (stat.value > stat.target) {
            stat.value = stat.target; // Ensure it doesn't exceed the target
          }
          setTimeout(updateValue, 20); // Adjust speed of incrementing
        }
      };
      updateValue();
    });
  }
}
