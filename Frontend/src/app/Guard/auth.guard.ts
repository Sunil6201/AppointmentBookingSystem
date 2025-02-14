import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth.services';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.isLoggedIn(); // Check if the user is logged in
    const role = this.authService.getRole(); // Get the user role

    if (token && role) {
      // Optionally, you can also check for specific role requirements here
      if (role === 'Admin' || role === 'User') {
        return true; // Allow access based on the role
      } else {
        this.router.navigate(['/auth']); // Redirect if the role doesn't match required ones
        return false;
      }
    }

    this.router.navigate(['/auth']); // Redirect if not logged in
    return false; // Deny access
  }
}
