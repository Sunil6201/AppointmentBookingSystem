import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AuthComponent {
  showLogin: boolean = true; // Flag to toggle between login and register
  username: string = '';
  password: string = '';
  role: string = 'User'; // Default role
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  // Handles form submission for both login and registration
  onSubmit() {
    if (this.showLogin) {
      this.login(); // Call login if we're on the login form
    } else {
      this.onRegister(); // Call register if we're on the registration form
    }
  }

  // Handles user login
  login() {
    this.authService.login(this.username, this.password, this.role).subscribe({
      next: (response) => {
        console.log('Login response:', response); // Debugging line
        if (response.token) { // Ensure a token is returned
          // Navigate to the welcome page (dashboard) after successful login
          this.router.navigate(['/welcome']);
        } else {
          this.errorMessage = 'Login failed. No token received.'; // Display error if no token
        }
      },
      error: (err) => {
        console.error('Login error:', err); // Log the error for debugging
        this.errorMessage = 'Invalid credentials. Please try again.'; // User-friendly error message
      }
    });
  }

  // Handles user registration
  onRegister() {
    this.authService.register(this.username, this.password, this.role).subscribe({
      next: () => {
        this.showLogin = true; // Switch back to login form after successful registration
        this.errorMessage = null; // Clear any existing error messages
      },
      error: (err: { error: string | null; }) => {
        console.error('Registration error:', err); // Log the error for debugging
        
        // Check for specific error response indicating user already exists
        if (err.error === 'User already exists') {
          this.errorMessage = 'User already exists with the same username, password, and role.';
        } else {
          this.errorMessage = err.error || 'Registration successful! You can now log in.'; // User-friendly error message
        }
      }
    });
  }

  // Toggles between login and registration forms
  toggleForm() {
    this.showLogin = !this.showLogin; // Switch between login and register form
    this.errorMessage = null; // Clear any existing error messages when toggling
  }
}
