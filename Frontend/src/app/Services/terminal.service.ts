// terminal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../Services/auth.services'; // Ensure correct path to AuthService
import { Router } from '@angular/router'; // Import Router

@Injectable({
  providedIn: 'root', // Singleton service
})
export class TerminalService {
  private apiUrl = 'http://localhost:5096/api/terminal'; // API endpoint for terminals

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  // Method to get HTTP headers with Authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); 
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } 

    return headers.set('Content-Type', 'application/json');
  }

  // Fetch all terminals with ID and terminal name
  getAllTerminals(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(terminals => terminals.map(terminal => ({
          id: terminal.id,
          terminalName: terminal.terminalName,
          location: terminal.location
        }))), // Adjusted to show terminalName
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Fetch a terminal by ID (if needed)
  getTerminalById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Create a new terminal
  createTerminal(terminal: any): Observable<any> {
    const { id, ...terminalData } = terminal; // Remove id from terminal data
    return this.http.post<any>(this.apiUrl, terminalData, { headers: this.getHeaders() }) // Send terminalData without id
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Update an existing terminal
  updateTerminal(terminal: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${terminal.id}`, terminal, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Soft delete a terminal by ID
  softDeleteTerminal(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/soft-delete/${id}`, {}, { headers: this.getHeaders() }) // Send PATCH request for soft delete
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Hard delete a terminal by ID (permanent delete)
  deleteTerminal(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }) // Send DELETE request for hard delete
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Handle unauthorized access
  private handleUnauthorized(error: any) {
    if (error.status === 401) {
      console.warn('Unauthorized access - please login again.');
      this.authService.logout(); // Log out user
      this.router.navigate(['/auth']); // Redirect to login page
    }
  }
}
