import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  role: string = 'User'; // Default role
  message: string | null = null; // Combined message for success and error

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.authService.register(this.username, this.password, this.role).subscribe({
      next: () => {
        this.message = 'Registration successful! Redirecting to login...'; // Success message
        setTimeout(() => this.router.navigate(['/login']), 2000); // Redirect after 2 seconds
      },
      error: (err) => {
        // Check for specific error response from the server
        if (err.status === 409) { // Assuming 409 Conflict for already registered user
          this.message = 'User already registered! Please log in.';
        } else {
          this.message = 'Registration failed! Please try again.';
        }
      }
    });
  }
}
