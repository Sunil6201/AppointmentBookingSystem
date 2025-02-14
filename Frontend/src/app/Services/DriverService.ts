  import { Injectable } from '@angular/core';
  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { Observable, throwError } from 'rxjs';
  import { catchError, map } from 'rxjs/operators';
  import { AuthService } from '../Services/auth.services'; // Ensure correct path to AuthService
  import { Router } from '@angular/router';

  @Injectable({
    providedIn: 'root', // This makes it a singleton across the app
  })
  export class DriverService {
    private apiUrl = 'http://localhost:5096/api/driver'; // API endpoint for drivers

    constructor(
      private http: HttpClient,
      private authService: AuthService,
      private router: Router
    ) {}

    // Function to get the HTTP headers with the Authorization token
    private getHeaders(): HttpHeaders {
      const token = this.authService.getToken(); // Use AuthService to get the token
      let headers = new HttpHeaders();

      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      return headers.set('Content-Type', 'application/json');
    }

    // Fetch all drivers (including driver numbers and other details)
    getAllDrivers(): Observable<{
      status: unknown; id: number; vehicleNumber: string; driverMobileNumber: string; licenseNumber: string 
}[]> {
      return this.http.get<{ id: number; vehicleNumber: string; driverMobileNumber: string; licenseNumber: string,driverName:string,status:boolean}[]>(this.apiUrl, { headers: this.getHeaders() })
        .pipe(
          map(drivers => drivers.map(driver => ({
            id: driver.id,
            driverMobileNumber: driver.driverMobileNumber,
            licenseNumber: driver.licenseNumber,
            vehicleNumber: driver.vehicleNumber, // Include vehicle number
            driverName:driver.driverName,
            status:driver.status
          }))),
          catchError((error) => {
            this.handleUnauthorized(error);
            return throwError(error);
          })
        );
    }

    // Fetch a driver by ID
    getDriverById(id: number): Observable<{ 
      id: number; 
      vehicleNumber: string; 
      driverMobileNumber: string; 
      driverName: string; // Added this property
      status: boolean; // Added this property
  }> {
      return this.http.get<{ 
          id: number; 
          vehicleNumber: string; 
          driverMobileNumber: string; 
          driverName: string; // Ensure this property is included in the response type
          status: boolean; // Ensure this property is included in the response type
      }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
          catchError((error) => {
              this.handleUnauthorized(error);
              return throwError(error);
          })
      );
  }
  

    // Fetch unique vehicle numbers from drivers
    getVehicleNumbers(): Observable<string[]> {
      return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
        .pipe(
          map(drivers => [...new Set(drivers.map(driver => driver.vehicleNumber))]), // Extract unique vehicle numbers
          catchError((error) => {
            this.handleUnauthorized(error);
            return throwError(error);
          })
        );
    }

    // Create a new driver
    createDriver(driver: any): Observable<any> {
      return this.http.post<any>(this.apiUrl, driver, { headers: this.getHeaders() })
        .pipe(
          catchError((error) => {
            this.handleUnauthorized(error);
            return throwError(error);
          })
        );
    }

    // Update an existing driver
    updateDriver(driver: any): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}/${driver.id}`, driver, { headers: this.getHeaders() })
        .pipe(
          catchError((error) => {
            this.handleUnauthorized(error);
            return throwError(error);
          })
        );
    }

    // Soft delete a driver
    softDeleteDriver(id: number): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/softdelete/${id}`, {}, { headers: this.getHeaders() })
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
        this.authService.logout(); // Log out if token is invalid
        this.router.navigate(['/auth']); // Redirect to login page
      }
    }
  }
