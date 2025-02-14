// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5096/api/authenticate'; // Update with your actual API URL

  constructor(private http: HttpClient, private router: Router) {}

  // Login function to authenticate and store JWT, username, and role
  login(username: string, password: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { Username: username, Password: password, Role: role }).pipe(
      tap(response => {
        // Store the JWT token, role, and username in local storage
        localStorage.setItem('jwt', response.token); 
        localStorage.setItem('role', response.role || role); // Store role from response or parameter
        localStorage.setItem('username', response.username || username); // Store username from response or parameter

        // Fetch and store userId from token if applicable
        const userId = this.getUserIdFromToken(response.token);
        localStorage.setItem('userId', userId); // Store userId in local storage
      }),
      catchError(this.handleError) // Add error handling
    );
  }

  // Register function for new users
  register(username: string, password: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, { Username: username, Password: password, Role: role }).pipe(
      catchError(this.handleError) // Add error handling
    );
  }

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 409) { // Assuming 409 Conflict for already registered user
        errorMessage = 'User already registered! Please log in.';
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  // Logout function to clear session and navigate to login
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId'); // Clear userId from local storage
    this.router.navigate(['/auth']); // Redirect to login page
  }

  // Check if the user is logged in by checking if the JWT exists
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt'); // Return true if JWT exists
  }

  // Get the role of the logged-in user
  getRole(): string | null {
    return localStorage.getItem('role'); // Retrieve role from local storage
  }

  // Get the username of the logged-in user
  getUsername(): string | null {
    return localStorage.getItem('username'); // Retrieve username from local storage
  }

  // Get the userId of the logged-in user
  getUserId(): string | null {
    return localStorage.getItem('userId'); // Retrieve userId from local storage
  }

  // Method to decode the JWT and extract userId
 getUserIdFromToken(token: string): string {
    const payload = this.decodeToken(token);
    return payload?.UserId || ''; // Adjust based on your token payload structure
  }

  // Decode the JWT to access its payload
  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)); // Decode base64 URL string to JSON
  }

  // Example method to get container numbers (update with your actual API endpoint)
  getContainerNumbers(): Observable<string[]> {
    return this.http.get<string[]>('/api/container-numbers'); // Update with your actual API endpoint
  }

  // Method to get the JWT token
  getToken(): string | null {
    return localStorage.getItem('jwt'); // Retrieve JWT token from local storage
  }
}
