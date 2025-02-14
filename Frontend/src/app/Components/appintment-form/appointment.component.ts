import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../Services/appointment.service';
import { TruckingCompanyService } from '../../Services/trucking-company.service';
import { TerminalService } from '../../Services/terminal.service';
import { DriverService } from '../../Services/DriverService';
import { ContainerService } from '../../Services/Container.Service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.services';
import { ShipService } from '../../Services/ship.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NavbarComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppointmentComponent implements OnInit {
  step: number = 1;
  appointmentForm: FormGroup;
  truckingCompanies: any[] = [];
  terminals: any[] = [];
  drivers: any[] = [];
  containers: any[] = [];
  ships: any[] = [];
  userId: number | null = null; // Updated to allow null value
  truckPlates: any[] = [];
  ticketNumber: string = 'Appointment';
  username: string = '';
  isConfirmed: boolean = false;
  confirmationChecked: boolean = false;
  portNumbers: string[] = ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008', 'P009', 'P010'];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private truckingCompanyService: TruckingCompanyService,
    private terminalService: TerminalService,
    private driverService: DriverService,
    private containerService: ContainerService,
    private authService: AuthService,
    private router: Router,
    private shipService: ShipService
  ) {
    this.appointmentForm = this.fb.group({
      truckingCompanyId: ['', Validators.required],
      terminalId: ['', Validators.required],
      moveType: ['', Validators.required],
      containerId: ['', Validators.required],
      port: ['', Validators.required],
      unitNumber: ['', Validators.required],
      equipSize: ['', Validators.required],
      hasChassisNumber: [false],
      chassisNumber: [''],
      truckPlate: ['', Validators.required],
      driverId: ['', Validators.required],
      licenceNumber: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      driverMobileNumber: [''],
      ticketNumber: [''],
      shipId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchData();
    this.loadShips();

    // Fetch user ID from local storage
    const userIdFromStorage = localStorage.getItem('userId'); // Assuming you store userId in local storage
    this.userId = userIdFromStorage ? +userIdFromStorage : null; // Convert to number or set to null

    const usernameFromService = this.authService.getUsername();
    this.username = usernameFromService ?? '';
  }

  fetchData() {
    this.truckingCompanyService.getAllTruckingCompanies().subscribe(data => {
      this.truckingCompanies = data;
    });

    this.terminalService.getAllTerminals().subscribe(data => {
      this.terminals = data;
    });

    this.driverService.getAllDrivers().subscribe(data => {
      this.drivers = data.filter(driver => !driver.status);
    });

    this.containerService.getAllContainers().subscribe(data => {
      this.containers = data.filter(container => !container.status);
    });

    this.shipService.getShips().subscribe(data => {
      this.ships = data.filter(ship => !ship.status);
    });

    this.updateTruckPlates();
  }

  loadShips() {
    this.shipService.getShips().subscribe({
      next: (data) => {
        this.ships = data;
      },
      error: (error) => {
        console.error('Error fetching ships:', error);
      },
    });
  }

  onDriverChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const driverId = Number(selectElement.value);

    const selectedDriver = this.drivers.find(driver => driver.id === driverId);

    if (selectedDriver) {
      this.appointmentForm.patchValue({
        licenceNumber: selectedDriver.licenseNumber ?? '',
        truckPlate: selectedDriver.vehicleNumber ?? '',
        driverMobileNumber: selectedDriver.driverMobileNumber ?? ''
      });
    } else {
      this.appointmentForm.patchValue({
        licenceNumber: '',
        truckPlate: '',
        driverMobileNumber: ''
      });
    }
  }

  toggleChassisNumber() {
    const hasChassisNumber = this.appointmentForm.get('hasChassisNumber')?.value;

    if (hasChassisNumber) {
      this.appointmentForm.get('chassisNumber')?.setValidators(Validators.required);
    } else {
      this.appointmentForm.get('chassisNumber')?.clearValidators();
      this.appointmentForm.get('chassisNumber')?.setValue('');
    }
    this.appointmentForm.get('chassisNumber')?.updateValueAndValidity();
  }

  updateTruckPlates() {
    const truckingCompanyId = this.appointmentForm.get('truckingCompanyId')?.value;

    if (truckingCompanyId) {
      this.truckingCompanyService.getTruckPlatesByCompany(truckingCompanyId).subscribe(data => {
        this.truckPlates = data;
      });
    }
  }

  nextStep() {
    if (this.step < 5) {
      this.step++;
    }
  }

    goBack() {
    // Navigate to the previous page or welcome page
    this.router.navigate(['/welcome']);  // You can change '/welcome' to the appropriate route
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  toggleConfirmation(): void {
    this.isConfirmed = !this.isConfirmed;
    this.confirmationChecked = this.isConfirmed;
  }

  confirmAppointment(): void {
    if (this.appointmentForm.valid && this.isConfirmed) {
      this.storeAppointmentData();
      this.step = 5; // Move to Step 5 to show the ticket number after booking
    } else {
      alert('Please confirm the appointment to proceed.');
    }
  }

  storeAppointmentData() {
    const appointmentData = {
      ...this.appointmentForm.value,
      userId: this.userId // Use the userId fetched from local storage
    };

    this.appointmentService.bookAppointment(appointmentData).subscribe(response => {
      if (response) {
        this.ticketNumber = response; // Get the ticket number returned from the booking service
        console.log('Appointment booked successfully. Ticket Number:', this.ticketNumber);
      } else {
        console.error('Error creating appointment:', response);
      }
    });
  }

  resetForm() {
    this.appointmentForm.reset();
    this.router.navigate(['/welcome']);
  }

  isAppointmentConfirmed(): boolean {
    return this.isConfirmed;
  }

  getSelectedOption(formControlName: string, options: any[], displayProperty: string = 'name'): string {
    const selectedId = this.appointmentForm.get(formControlName)?.value;
    const selectedOption = options.find(option => option.id === selectedId);
    return selectedOption ? selectedOption[displayProperty] : 'Not Selected';
  }

  submitAppointment(): void {
    if (this.appointmentForm.valid) {
      this.confirmAppointment(); // Call the existing confirmAppointment method
    } else {
      alert('Please fill in all required fields.');
    }
  }
}
