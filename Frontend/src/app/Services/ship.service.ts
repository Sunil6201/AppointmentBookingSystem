import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../Services/auth.services'; // Ensure correct path to AuthService
import { Router } from '@angular/router';
 
@Injectable({
  providedIn: 'root',
})
export class ShipService {
  private apiUrl = 'http://localhost:5096/api/ship'; // Ensure correct API URL
 
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}
 
  // Generate headers with the Authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
 
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
 
    return headers.set('Content-Type', 'application/json');
  }
  getShips(): Observable<{ 
    id: number; 
    shipNumber: string; 
    timeSlot: string; // Using string to represent TimeSpan as an ISO string or formatted time
    isDeleted: boolean; 
    status: boolean 
}[]> {
    return this.http.get<{ 
        id: number; 
        shipNumber: string; 
        timeSlot: string; // Assuming you will convert this to string from TimeSpan
        isDeleted: boolean; 
        status: boolean 
    }[]>(this.apiUrl, { headers: this.getHeaders() })
    .pipe(
        map(ships => ships
            .filter(ship => !ship.isDeleted) // Filter out soft-deleted ships
            .map(ship => ({
                id: ship.id,
                shipNumber: ship.shipNumber,
                timeSlot: ship.timeSlot, // Assuming you want to keep it as is or format it
                isDeleted: ship.isDeleted, // You might choose not to include this in final output
                status: ship.status
            }))
        ),
        catchError((error) => {
            this.handleUnauthorized(error);
            return throwError(error);
        })
    );
}

 
  // Create a new ship
  createShip(ship: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, ship, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }
 
  // Update an existing ship
  updateShip(ship: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ship.id}`, ship, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }
 
  // Soft delete a ship (set IsDeleted to true)
  softDeleteShip(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/softdelete/${id}`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }
 
  // Handle unauthorized responses and redirect to login
  private handleUnauthorized(error: any) {
    if (error.status === 401) {
      console.warn('Unauthorized access - please login again.');
      this.authService.logout();
      this.router.navigate(['/auth']); // Redirect to login page
    }
  }
}