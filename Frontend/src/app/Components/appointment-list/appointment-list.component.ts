import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../Services/appointment.service';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./appointment-list.component.css'],
})
export class AppointmentListComponent implements OnInit {
  appointments: any[] = [];
  paginatedAppointments: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  selectedAppointment: any = {}; 
  isModalOpen: boolean = false; 

  // Pagination variables
  currentPage: number = 1;
  itemsPerPage: number = 8;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.fetchAppointments();
  }

  private fetchAppointments(): void {
    this.appointmentService.getAllAppointments().subscribe(
      (data) => {
        this.appointments = data.map((appointment: any) => ({
          ...appointment,
          terminalName: appointment.terminal ? appointment.terminal.terminalName : 'N/A',
          
        }));
        this.paginateAppointments();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching appointments:', error);
        this.errorMessage = 'Failed to load appointments. Please try again later.';
        this.isLoading = false;
      }
    );
  }

  // Approve appointment
  approveAppointment(appointment: any): void {
    this.appointmentService.approveAppointment(appointment.id).subscribe(
      () => {
        alert('Appointment approved successfully');
        this.fetchAppointments(); 
      },
      (error) => {
        console.error('Error approving appointment:', error);
        alert('Failed to approve appointment');
      }
    );
  }

  // Reject appointment
  rejectAppointment(appointment: any): void {
    this.appointmentService.rejectAppointment(appointment.id).subscribe(
      () => {
        alert('Appointment rejected successfully');
        this.fetchAppointments(); 
      },
      (error) => {
        console.error('Error rejecting appointment:', error);
        alert('Failed to reject appointment');
      }
    );
  }

  private paginateAppointments(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAppointments = this.appointments.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.paginateAppointments();
  }

  openUpdateModal(appointment: any): void {
    this.selectedAppointment = { ...appointment }; 
    this.isModalOpen = true; 
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  updateAppointment(): void {
    this.appointmentService.updateAppointment(this.selectedAppointment).subscribe(
      () => {
        alert('Appointment updated successfully');
        this.fetchAppointments(); 
        this.closeModal(); 
      },
      (error) => {
        console.error('Error updating appointment:', error);
        alert('Failed to update appointment');
      }
    );
  }

  // Soft delete appointment
  softDeleteAppointment(appointmentId: number): void {
    this.appointmentService.softDeleteAppointment(appointmentId).subscribe(
      () => {
        alert('Appointment deleted successfully');
        this.fetchAppointments(); 
      },
      (error) => {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment');
      }
    );
  }
}
