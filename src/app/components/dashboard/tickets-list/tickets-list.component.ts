import {Component, OnInit} from '@angular/core';
import {Ticket} from "../../../interfaces/ticket";
import {TicketService} from "../../../services/ticket.service";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import Swal from "sweetalert2";

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    NgForOf,
    NgIf,
    RouterLink
  ],
  templateUrl: './tickets-list.component.html',
  styleUrl: './tickets-list.component.css'
})
export class TicketsListComponent implements OnInit {
  tickets: Ticket[] = [];
  paginatedTickets: Ticket[] = [];
  currentPage = 1;
  pageSize = 9; // 9 tickets per page as requested
  totalPages = 1;
  Math = Math; // Make Math available to template

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.totalPages = Math.ceil(this.tickets.length / this.pageSize);
        this.updatePaginatedTickets();
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
      }
    });
  }

  updatePaginatedTickets(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.tickets.length);
    this.paginatedTickets = this.tickets.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTickets();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of pages to show
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);

      // Adjust if at edges
      if (this.currentPage <= 2) {
        end = 4;
      } else if (this.currentPage >= this.totalPages - 1) {
        start = this.totalPages - 3;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push(-1); // -1 will be rendered as ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < this.totalPages - 1) {
        pages.push(-2); // -2 will be rendered as ellipsis
      }

      // Always show last page
      pages.push(this.totalPages);
    }

    return pages;
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
