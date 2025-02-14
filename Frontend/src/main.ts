import { bootstrapApplication } from '@angular/platform-browser'; // Import bootstrapApplication from platform-browser
import { AppComponent } from './app/app.component'; // Import AppComponent
import { appConfig } from './app/app.config'; // Import app configuration

// Bootstrap the root component (AppComponent) with the app configuration
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Error during app bootstrap:', err));
