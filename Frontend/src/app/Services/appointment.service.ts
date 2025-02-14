import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.services';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5096/api'; // Adjust your API URL

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  // Helper method to get HTTP headers with the Authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Retrieve the token from AuthService
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers.set('Content-Type', 'application/json');
  }

  // Fetch all appointments from the API
  getAllAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointment`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this.handleHttpError(error)) // Centralized error handling
      );
  }

  // Update an appointment
  updateAppointment(appointment: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/appointment/${appointment.id}`, appointment, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this.handleUnauthorized(error))
      );
  }

  // Soft delete an appointment
  softDeleteAppointment(appointmentId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/appointment/${appointmentId}/delete`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this.handleUnauthorized(error))
      );
  }

  // Fetch trucking companies from the API
  getTruckingCompanies(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/truckingcompany`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this.handleUnauthorized(error))
      );
  }

  // Fetch container numbers from the API
  getContainerNumbers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/container`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this.handleUnauthorized(error))
      );
  }

  // Fetch terminal names from the API
  getTerminalNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/terminal`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this.handleUnauthorized(error))
      );
  }

  // Fetch drivers from the API
  getAllDrivers(): Observable<{ id: number; vehicleNumber: string; driverMobileNumber: string; licenseNumber: string }[]> {
    return this.http.get<{ id: number; vehicleNumber: string; driverMobileNumber: string; licenseNumber: string }[]>(`${this.apiUrl}/driver`, { headers: this.getHeaders() })
      .pipe(
        map(drivers => drivers.map(driver => ({
          id: driver.id,
          driverMobileNumber: driver.driverMobileNumber,
          licenseNumber: driver.licenseNumber,
          vehicleNumber: driver.vehicleNumber
        }))),
        catchError((error) => this.handleUnauthorized(error))
      );
  }

  // Book an appointment by sending booking details to the API
  bookAppointment(bookingDetails: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/appointment`, bookingDetails, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          return response.ticketNumber; // Adjust based on your API response structure
        }),
        catchError((error) => this.handleUnauthorized(error))
      );
  }
  approveAppointment(appointmentId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/appointment/${appointmentId}/approve`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this.handleUnauthorized(error))
      );
  }

  rejectAppointment(appointmentId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/appointment/${appointmentId}/reject`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this.handleUnauthorized(error))
      );
  }

  // Centralized error handling for HTTP requests
  private handleHttpError(error: HttpErrorResponse) {
    console.error('HTTP Error:', error);
    return throwError('An error occurred while communicating with the server. Please try again later.');
  }

  // Handle unauthorized access
  private handleUnauthorized(error: HttpErrorResponse) {
    if (error.status === 401) {
      console.error('Unauthorized access - redirecting to login.');
      this.router.navigate(['/login']); // Redirect to login if unauthorized
    }
    return this.handleHttpError(error); // Handle other errors as well
  }
}
