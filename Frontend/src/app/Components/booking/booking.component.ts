import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../Services/appointment.service';
import { ContainerService } from '../../Services/Container.Service';
import { TerminalService } from '../../Services/terminal.service';
import { AuthService } from '../../Services/auth.services';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../Services/DriverService';
import { TruckingCompanyService } from '../../Services/trucking-company.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class BookingComponent implements OnInit {
  step: number = 1; // Default step
  truckingCompanies: string[] = [];
  terminals: { id: number; terminalName: string }[] = [];
  containerNumbers: { id: number; containerNumber: string }[] = [];
  drivers: { id: number; driverMobileNumber: string }[] = [];
  vehicleNumbers: string[] = [];
  moveTypeOptions = ['Pick Full', 'Pick Empty', 'Drop Full', 'Drop Empty'];

  requiredData = {
    truckingCompany: '',
    terminal: '',
    moveType: '',
    containerNumber: ''
  };

  moveDetails = {
    unitNumber: '',
    equipSize: '',
    chassisNumber: '',
    truckPlate: '',
    driverId: null,
    hasChassisNumber: false
  };

  AppointmentDate  = {
    date: '',
    time: ''
  };

  confirmationMessage = '';
  confirmationChecked: boolean = false;
  showConfirmButton: boolean = false;
  showFireAnimation: boolean = false;
  ticketNumber: string = '';
  username: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private truckingCompanyService: TruckingCompanyService,
    private containerService: ContainerService,
    private terminalService: TerminalService,
    private driverService: DriverService,
    private authService: AuthService
  ) {
    this.loadInitialData();
    this.username = this.authService.getUsername();
  }

  ngOnInit() {
    this.initializeStepData(); // Initialize step data on component init
  }

  initializeStepData() {
    if (this.step === 1) {
      this.requiredData = { ...this.requiredData };
    } else if (this.step === 2) {
      this.moveDetails = { ...this.moveDetails };
    } else if (this.step === 3) {
      this.AppointmentDate  = { ...this.AppointmentDate  };
    }
  }

  loadInitialData() {
    this.truckingCompanyService.getAllTruckingCompanies().subscribe(
      (data: any[]) => {
        this.truckingCompanies = data.map(company => company.name);
        console.log('Trucking Companies:', this.truckingCompanies);
      },
      (error) => {
        this.handleError(error, 'Error loading trucking companies.');
      }
    );

    this.containerService.getAllContainers().subscribe(
      (data: { id: number; containerNumber: string }[]) => {
        this.containerNumbers = data;
        console.log('Container Numbers:', this.containerNumbers);
      },
      (error) => {
        this.handleError(error, 'Error loading container numbers.');
      }
    );

    this.terminalService.getAllTerminals().subscribe(
      (data: { id: number; terminalName: string }[]) => {
        this.terminals = data;
        console.log('Terminals:', this.terminals);
      },
      (error) => {
        this.handleError(error, 'Error loading terminals.');
      }
    );

    this.driverService.getAllDrivers().subscribe(
      (data: any[]) => {
        this.drivers = data.map(driver => ({
          id: driver.id,
          driverMobileNumber: driver.driverMobileNumber
        }));
        console.log('Drivers:', this.drivers);
      },
      (error) => {
        this.handleError(error, 'Error loading drivers.');
      }
    );

    this.driverService.getVehicleNumbers().subscribe(
      (data: string[]) => {
        this.vehicleNumbers = data;
        console.log('Vehicle Numbers:', this.vehicleNumbers);
      },
      (error) => {
        this.handleError(error, 'Error loading vehicle numbers.');
      }
    );
  }

  private handleError(error: any, customMessage: string) {
    console.error(customMessage, error);
    this.confirmationMessage = customMessage + ' Please try again later.';
  }

  nextStep() {
    if (this.step < 5) {
      this.step += 1; // Move to the next step
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step -= 1; // Move to the previous step
    }
  }

  onConfirmationChange() {
    this.showConfirmButton = this.confirmationChecked;
  }

  goToStep5() {
    if (this.confirmationChecked && this.validateStepData()) {
      this.step = 5; // Move to step 5 (confirmation message)
    } else {
      this.confirmationMessage = 'Please fill in all required fields before confirming.';
    }
  }

  bookAppointment() {
    const bookingDetails = {
      ...this.requiredData,
      ...this.moveDetails,
      AppointmentDate : this.AppointmentDate 
    };

    this.appointmentService.bookAppointment(bookingDetails).subscribe(
      (response: { ticketNumber: string }) => {
        this.ticketNumber = response.ticketNumber;
        this.showFireAnimation = true;
        this.step = 5; // Move to step 5
      },
      (error) => {
        this.handleError(error, 'Error booking appointment.');
      }
    );
  }

  validateStepData(): boolean {
    if (this.step === 1) {
      return !!(
        this.requiredData.truckingCompany &&
        this.requiredData.terminal &&
        this.requiredData.moveType &&
        this.requiredData.containerNumber
      );
    } else if (this.step === 2) {
      return !!(
        this.moveDetails.unitNumber &&
        this.moveDetails.equipSize &&
        this.moveDetails.truckPlate &&
        this.moveDetails.driverId &&
        (!this.moveDetails.hasChassisNumber || this.moveDetails.chassisNumber)
      );
    } else if (this.step === 3) {
      return !!(this.AppointmentDate .date && this.AppointmentDate .time);
    }
    return true;
  }

  resetForm() {
    this.step = 1; // Reset to step 1
  }

  getDriverNumber(driverId: number | null): string {
    const driver = this.drivers.find(d => d.id === driverId);
    return driver ? driver.driverMobileNumber : 'Unknown Driver';
  }
}
