import {Component, OnInit} from '@angular/core';
import {Ticket} from "../../../interfaces/ticket";
import {TicketService} from "../../../services/ticket.service";
import {DatePipe, NgClass, NgForOf} from "@angular/common";
import {RouterLink} from "@angular/router";
import Swal from "sweetalert2";

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    NgForOf,
    RouterLink
  ],
  templateUrl: './tickets-list.component.html',
  styleUrl: './tickets-list.component.css'
})
export class TicketsListComponent implements OnInit {
  tickets: Ticket[] = [];

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
      }
    });
  }
  deleteTicket(ticketId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this ticket!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c1121f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ticketService.deleteTicket(ticketId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The ticket has been deleted.',
              icon: 'success',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            this.loadTickets();
          },
          error: (error) => {
            console.error('Error deleting ticket:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete the ticket.',
              icon: 'error',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }
}
