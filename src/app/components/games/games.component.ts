import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from "../../interfaces/game";
import { GameService } from "../../services/game.service";
import { Ticket } from "../../interfaces/ticket";
import { CartService } from "../../services/cart.service";
import { AuthService } from "../../services/auth.service";
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  displayedGames: Game[] = [];

  competitionFilter: string = 'all';
  venueFilter: string = 'all';
  timeFilter: string = 'all';

  currentPage: number = 1;
  gamesPerPage: number = 9;
  totalPages: number = 1;

  isLoggedIn: boolean = false;
  userId: number | null = null;

  showTicketModal: boolean = false;
  selectedGame: Game | null = null;
  selectedTicket: Ticket | null = null;
  ticketQuantity: number = 1;

  competitionNames: { [key: string]: string } = {
    'BOTOLA_PRO': 'Botola Pro',
    'THRONE_CUP': 'Throne Cup',
    'CAF_SUPER_CUP': 'CAF Super Cup',
    'CLUB_WORLD_CUP': 'Club World Cup'
  };

  constructor(
    private gameService: GameService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGames();

    this.authService.authState$.subscribe(state => {
      this.isLoggedIn = state.isLoggedIn;
      if (this.isLoggedIn) {
        const user = this.authService.getUser();
        if (user) {
          this.userId = user.id;
        }
      }
    });
  }

  loadGames(): void {
    this.gameService.getAllGames().subscribe({
      next: (data) => {
        this.games = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error fetching games', error);
      }
    });
  }

  applyFilters(): void {
    let result = [...this.games];

    const now = new Date();
    result = result.filter(game => {
      const [year, month, day] = game.date.split('-').map(Number);
      const [hours, minutes] = game.time.split(':').map(Number);

      const gameDate = new Date(year, month - 1, day, hours, minutes);

      return gameDate >= now;
    });

    result.sort((a, b) => {
      const [yearA, monthA, dayA] = a.date.split('-').map(Number);
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA);

      const [yearB, monthB, dayB] = b.date.split('-').map(Number);
      const [hoursB, minutesB] = b.time.split(':').map(Number);
      const dateB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB);

      return dateA.getTime() - dateB.getTime();
    });

    if (this.competitionFilter !== 'all') {
      result = result.filter(game => game.competition === this.competitionFilter);
    }

    if (this.venueFilter !== 'all') {
      const isHome = this.venueFilter === 'home';
      result = result.filter(game => {
        const isGameAtMohammedV = true;
        return isHome ? isGameAtMohammedV : !isGameAtMohammedV;
      });
    }

    if (this.timeFilter !== 'all') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      result = result.filter(game => {
        const [year, month, day] = game.date.split('-').map(Number);
        const gameDate = new Date(year, month - 1, day);

        if (this.timeFilter === 'thisWeek') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);

          return gameDate >= startOfWeek && gameDate <= endOfWeek;
        } else if (this.timeFilter === 'thisMonth') {
          return gameDate.getMonth() === currentMonth && gameDate.getFullYear() === currentYear;
        } else if (this.timeFilter === 'nextMonth') {
          const nextMonth = (currentMonth + 1) % 12;
          const yearOfNextMonth = currentMonth === 11 ? currentYear + 1 : currentYear;
          return gameDate.getMonth() === nextMonth && gameDate.getFullYear() === yearOfNextMonth;
        }

        return true;
      });
    }

    this.filteredGames = result;
    this.totalPages = Math.ceil(this.filteredGames.length / this.gamesPerPage);
    this.currentPage = 1;
    this.updateDisplayedGames();
  }

  updateDisplayedGames(): void {
    const startIndex = (this.currentPage - 1) * this.gamesPerPage;
    const endIndex = Math.min(startIndex + this.gamesPerPage, this.filteredGames.length);
    this.displayedGames = this.filteredGames.slice(startIndex, endIndex);
  }

  changeCompetitionFilter(filter: string): void {
    this.competitionFilter = filter;
    this.applyFilters();
  }

  changeVenueFilter(filter: string): void {
    this.venueFilter = filter;
    this.applyFilters();
  }

  changeTimeFilter(filter: string): void {
    this.timeFilter = filter;
    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedGames();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedGames();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedGames();
    }
  }

  getTicketPriceRange(game: Game): string {
    if (!game.tickets || game.tickets.length === 0) {
      return 'N/A';
    }

    const prices = game.tickets.map(ticket => ticket.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return `${minPrice}-${maxPrice} MAD`;
  }

  getAvailabilityStatus(game: Game): { text: string; class: string } {
    if (!game.tickets || game.tickets.length === 0) {
      return { text: 'Sold Out', class: 'bg-gray-500' };
    }

    const totalTickets = game.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

    if (totalTickets === 0) {
      return { text: 'Sold Out', class: 'bg-gray-500' };
    } else if (totalTickets < 100) {
      return { text: 'Selling Fast', class: 'bg-amber-500 animate-pulse' };
    } else {
      return { text: 'Tickets Available', class: 'bg-green-500' };
    }
  }

  formatDate(dateString: string): { day: string; month: string; dayName: string } {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const dayName = date.toLocaleString('default', { weekday: 'short' }).toUpperCase();

    return { day, month, dayName };
  }

  resetFilters(): void {
    this.competitionFilter = 'all';
    this.venueFilter = 'all';
    this.timeFilter = 'thisMonth';
    this.applyFilters();
  }

  // Modal methods
  openTicketModal(game: Game): void {
    // Check if user is logged in first
    if (!this.isLoggedIn || !this.userId) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You must be logged in to purchase tickets',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#c1121f'
      });
      return;
    }

    // Only open the modal if tickets are available
    if (game.tickets && game.tickets.length > 0 &&
      this.getAvailabilityStatus(game).text !== 'Sold Out') {
      this.selectedGame = game;
      this.showTicketModal = true;
      this.selectedTicket = null;
      this.ticketQuantity = 1;
    }
  }

  closeModal(): void {
    this.showTicketModal = false;
    this.selectedGame = null;
    this.selectedTicket = null;
    this.ticketQuantity = 1;
  }

  selectTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    // Reset quantity to 1 when changing tickets
    this.ticketQuantity = 1;
  }

  incrementQuantity(): void {
    if (this.ticketQuantity < 3 &&
      this.selectedTicket &&
      this.ticketQuantity < this.selectedTicket.quantity) {
      this.ticketQuantity++;
    }
  }

  decrementQuantity(): void {
    if (this.ticketQuantity > 1) {
      this.ticketQuantity--;
    }
  }

  validateQuantity(): void {
    // Ensure quantity is a number, between 1 and 3, and less than available tickets
    if (isNaN(this.ticketQuantity) || this.ticketQuantity < 1) {
      this.ticketQuantity = 1;
    } else if (this.ticketQuantity > 3) {
      this.ticketQuantity = 3;
    }

    // Make sure quantity doesn't exceed available tickets
    if (this.selectedTicket && this.ticketQuantity > this.selectedTicket.quantity) {
      this.ticketQuantity = this.selectedTicket.quantity;
    }
  }

  calculateTotal(): number {
    if (!this.selectedTicket) return 0;
    return this.selectedTicket.price * this.ticketQuantity;
  }

  addToCart(): void {
    if (!this.selectedTicket || !this.selectedTicket.id) {
      return;
    }

    if (!this.isLoggedIn || !this.userId) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You must be logged in to purchase tickets',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#c1121f'
      });
      return;
    }

    this.cartService.addTicketToCart(this.userId, this.selectedTicket.id, this.ticketQuantity).subscribe({
      next: (updatedCart) => {
        this.closeModal();

        // Show success message with SweetAlert
        Swal.fire({
          title: 'Success!',
          text: `${this.ticketQuantity} ticket(s) added to your cart!`,
          icon: 'success',
          confirmButtonText: 'Continue Shopping',
          confirmButtonColor: '#c1121f',
          showCancelButton: true,
          cancelButtonText: 'View Cart',
          cancelButtonColor: '#333'
        }).then((result) => {
          if (!result.isConfirmed) {
            this.router.navigate(['/cart']);
          }
        });
      },
      error: (err) => {
        console.error('Error adding to cart:', err);

        // Show error message with SweetAlert
        Swal.fire({
          title: 'Error',
          text: 'Could not add tickets to cart. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#c1121f'
        });
      }
    });
  }
}
