import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  role: string = 'User'; // Default role
  message: string | null = null; // Combined message for success and error

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password, this.role).subscribe({
      next: () => {
        this.message = 'Login successful!'; // Success message
        setTimeout(() => this.router.navigate(['/welcome']), 2000); // Redirect after 2 seconds
      },
      error: () => {
        this.message = 'Invalid credentials. Please try again.'; // Short error message
      }
    });
  }
}
