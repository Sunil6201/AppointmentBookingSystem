import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from './Guard/auth.guard';
import { DriverComponent } from './Components/Driver-form/driver.component';
import { TerminalComponent } from './Components/terminal-form/terminal.component';
import { ContainerComponent } from './Components/Container-form/container.component';
import { TruckingCompanyComponent } from './Components/TruckingCompany-form/trucking-company.component';
import { AppointmentComponent } from './Components/appintment-form/appointment.component';
import { ShipComponent } from './Components/ship-form/ship.component';



export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./Components/auth-form/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'welcome',
    loadComponent: () => import('./Components/Welcome-form/welcome.component').then(m => m.WelcomeComponent),
    canActivate: [RoleGuard]
  },
  {
    path: 'book-appointment',
    loadComponent: () => import('./Components/booking/booking.component').then(m => m.BookingComponent),
    canActivate: [RoleGuard]
  },
  {
    path: 'drivers',
    loadComponent: () => import('./Components/Driver-form/driver.component').then(m => m.DriverComponent),
    canActivate: [RoleGuard]
  },
  {
    path: 'appointments',
    loadComponent: () => import('./Components/appintment-form/appointment.component').then(m => m.AppointmentComponent),
    canActivate: [RoleGuard]
  },
  
  {
    path: 'terminals',
    loadComponent: () => import('./Components/terminal-form/terminal.component').then(m => m.TerminalComponent),
    canActivate: [RoleGuard]
  },
  {
    path: 'containers',
    loadComponent: () => import('./Components/Container-form/container.component').then(m => m.ContainerComponent),
    canActivate: [RoleGuard]
  },
  {
    path: 'trucking-companies',
    loadComponent: () => import('./Components/TruckingCompany-form/trucking-company.component').then(m => m.TruckingCompanyComponent),
    canActivate: [RoleGuard]
  },
  {
    path: 'ships',
    loadComponent: () => import('./Components/ship-form/ship.component').then(m => m.ShipComponent),
    canActivate: [RoleGuard]
  },
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
