import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Ensure HttpClientModule is imported
import { LoginComponent } from './Components/Login-form/login.component'; // Ensure LoginComponent is imported correctly

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,    // Enables dynamic routing
    CommonModule,    // Common Angular directives (ngIf, ngFor, etc.)
    FormsModule,     // Handles form-based interactions
    HttpClientModule, // Handles HTTP requests
    LoginComponent   // Imports the login component
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AdventEmodelAngular'; // Title of the Angular app
}
