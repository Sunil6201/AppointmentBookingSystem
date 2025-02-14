import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../Services/auth.services';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ContainerService {
  private apiUrl = 'http://localhost:5096/api/container';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers.set('Content-Type', 'application/json');
  }

  // Fetch all containers
  getAllContainers(): Observable<any[]> {
    return this.http
      .get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map((containers) =>
          containers.map((container) => ({
            id: container.id,
            containerNumber: container.containerNumber,
            type: container.type,
            size: container.size,
            isDeleted: container.isDeleted,
            status:container.status // Include isDeleted property
          }))
        ),
        catchError((error) => {
          this.handleUnauthorized(error);
          console.error('Error fetching containers:', error);
          return throwError('Failed to fetch containers. Please try again later.');
        })
      );
  }

  // Fetch a container by ID
  getContainerById(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          console.error('Error fetching container:', error);
          return throwError('Failed to fetch the container. Please try again later.');
        })
      );
  }

  // Create a new container
  createContainer(container: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, container, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          console.error('Error creating container:', error);
          return throwError('Failed to create container: ' + (error.error?.message || 'Unknown error.'));
        })
      );
  }

  // Update an existing container
  updateContainer(id: number, container: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, container, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          console.error('Error updating container:', error);
          return throwError('Failed to update container: ' + (error.error?.message || 'Unknown error.'));
        })
      );
  }

  // Soft delete a container by ID
  softDeleteContainer(id: number): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/softdelete/${id}`, null, { headers: this.getHeaders() }) // Send a POST request to soft delete
      .pipe(
        catchError((error) => {
          this.handleUnauthorized(error);
          console.error('Error deleting container:', error);
          return throwError('Failed to delete container: ' + (error.error?.message || 'Unknown error.'));
        })
      );
  }

  private handleUnauthorized(error: any): void {
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
