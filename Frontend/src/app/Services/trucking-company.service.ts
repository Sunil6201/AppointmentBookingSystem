import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../Services/auth.services'; // Corrected import casing
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TruckingCompanyService {
  private apiUrl = 'http://localhost:5096/api/truckingcompany'; // API endpoint for trucking companies

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers.set('Content-Type', 'application/json');
  }

  // Fetch all trucking companies
  getAllTruckingCompanies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(companies => companies.map(company => ({ 
          id: company.id, 
          name: company.name,
          dropType: company.dropType // Ensure dropType is included
        }))),
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Create a new trucking company
  createTruckingCompany(company: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, company, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Update an existing trucking company
  updateTruckingCompany(company: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${company.id}`, company, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Soft delete a trucking company
  softDeleteTruckingCompany(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/softdelete/${id}`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          return throwError(error);
        })
      );
  }

  // Fetch truck plates based on the selected trucking company
  getTruckPlatesByCompany(truckingCompanyId: number): Observable<any[]> {
    const url = `${this.apiUrl}/${truckingCompanyId}/truckplates`; // Adjust the URL according to your API structure
    return this.http.get<any[]>(url, { headers: this.getHeaders() })
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
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
