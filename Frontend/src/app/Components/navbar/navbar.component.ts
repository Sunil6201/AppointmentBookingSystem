import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.services';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  username: string | null = null;
  role: string | null = null;
  showSidebar = false;

  constructor(private router: Router, private authService: AuthService) {
    if (this.isLoggedIn()) {
      this.username = this.authService.getUsername();
      this.role = this.authService.getRole();
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  // Navigation methods
  navigateToDrivers() {
    this.router.navigate(['/drivers']);
  }

  navigateToTerminals() {
    this.router.navigate(['/terminals']);
  }

  navigateToTruckingCompanies() {
    this.router.navigate(['/trucking-companies']);
  }

  navigateToContainers() {
    this.router.navigate(['/containers']);
  }

  navigateToShip() {
    this.router.navigate(['/ships']);
  }

  navigateToAppointments() {
    this.router.navigate(['/appointments']);
  }

  navigateToBooking() {
    this.router.navigate(['/booking']);
  }
}
