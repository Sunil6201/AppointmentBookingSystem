import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';  // Import RouterModule
import { AppComponent } from './app.component';
import { routes } from './app.routes';  // Import routes

@NgModule({
  declarations: [AppComponent],  // Remove LoginComponent from declarations since it's standalone
  imports: [
    BrowserModule,
    HttpClientModule,  // Add HttpClientModule
    RouterModule.forRoot(routes),  // Import RouterModule and pass the routes
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
