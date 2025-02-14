import { Component, OnInit } from '@angular/core';
import { TerminalService } from '../../Services/terminal.service'; // Ensure correct path to TerminalService
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component'; // Adjust the path as needed

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent], // Include NavbarComponent here
})
export class TerminalComponent implements OnInit {
  terminals: any[] = []; // Stores fetched terminals
  filteredTerminals: any[] = []; // Terminals to display after filtering
  terminal = { terminalName: '', location: '' }; // New terminal for create/update
  selectedTerminal: any = null; // Currently selected terminal for editing
  isEditing: boolean = false; // Flag for editing mode
  isModalOpen: boolean = false; // Flag for modal visibility
  actionsVisible: { [key: string]: boolean } = {}; // Track visibility of actions for each terminal
  searchQuery: string = ''; // Search query

  constructor(private terminalService: TerminalService, private router: Router) {}

  ngOnInit(): void {
    this.getTerminals(); // Fetch terminals when component loads
  }

  // Fetch all terminals
  getTerminals(): void {
    this.terminalService.getAllTerminals().subscribe(
      (data) => {
        this.terminals = data; // Store fetched terminals
        this.filteredTerminals = data; // Initialize filteredTerminals with all terminals
      },
      (error) => {
        console.error('Error fetching terminals', error);
      }
    );
  }

  // Open modal for create or update
  openModal(action: string, terminal?: any): void {
    this.isModalOpen = true;
    this.isEditing = action === 'update';
    if (this.isEditing && terminal) {
      this.selectedTerminal = terminal; // Set selected terminal for update
      this.terminal = { terminalName: terminal.terminalName, location: terminal.location }; // Set form data
    } else {
      this.resetForm(); // Reset form if creating
    }
  }

  // Close modal
  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm(); // Reset form on close
  }

  // Reset form
  resetForm(): void {
    this.terminal = { terminalName: '', location: '' }; // Reset fields
    this.selectedTerminal = null; // Clear selected terminal
    this.isEditing = false; // Reset editing flag
  }

  // Create or update terminal
  onSubmit(): void {
    if (this.isEditing) {
      this.updateTerminal();
    } else {
      this.createTerminal();
    }
  }

  // Create a new terminal
  createTerminal(): void {
    if (this.terminal.terminalName && this.terminal.location) {
      this.terminalService.createTerminal(this.terminal).subscribe(
        (response) => {
          this.getTerminals(); // Refresh terminal list
          this.closeModal(); // Hide modal after submission
        },
        (error) => {
          console.error('Error creating terminal', error);
        }
      );
    }
  }

  // Update an existing terminal
  updateTerminal(): void {
    if (this.selectedTerminal) {
      const updatedTerminal = { id: this.selectedTerminal.id, ...this.terminal }; // Preserve the ID for updating
      this.terminalService.updateTerminal(updatedTerminal).subscribe(
        (response) => {
          this.getTerminals(); // Refresh terminal list
          this.closeModal(); // Hide modal after submission
        },
        (error) => {
          console.error('Error updating terminal', error);
        }
      );
    }
  }

  // Soft delete a terminal
  softDeleteTerminal(id: number): void {
    if (confirm('Are you sure you want to soft delete this terminal?')) {
      this.terminalService.softDeleteTerminal(id).subscribe(
        () => {
          // Optimistically remove the terminal from the list
          this.terminals = this.terminals.filter(t => t.id !== id);
          this.filterTerminals(); // Refresh the filtered list
        },
        (error) => {
          console.error('Error soft deleting terminal', error);
        }
      );
    }
  }

  // Toggle visibility of action buttons for a terminal
  toggleActions(terminal: any): void {
    this.actionsVisible[terminal.id] = !this.actionsVisible[terminal.id];
  }

  // Check if actions are visible for a terminal
  isActionsVisible(terminal: any): boolean {
    return this.actionsVisible[terminal.id] || false;
  }

  // Go back to the welcome page
  goBack(): void {
    this.router.navigate(['/welcome']); // Navigate to the welcome page
  }

  // Filter terminals based on the search query
  filterTerminals(): void {
    if (this.searchQuery) {
      this.filteredTerminals = this.terminals.filter(terminal =>
        terminal.terminalName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        terminal.location.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredTerminals = this.terminals; // Reset to all terminals if search query is empty
    }
  }
}
