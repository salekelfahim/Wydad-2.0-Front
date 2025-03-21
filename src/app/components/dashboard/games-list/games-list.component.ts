import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Competition, Game } from "../../../interfaces/game";
import { GameService } from "../../../services/game.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.css'
})
export class GamesListComponent implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  displayedGames: Game[] = [];
  loading = true;
  error = false;

  // Search and filter
  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';
  selectedCompetition: string = '';
  selectedStatus: string = '';

  // Pagination
  currentPage: number = 1;
  gamesPerPage: number = 8;
  totalPages: number = 1;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.loading = true;
    this.gameService.getAllGames().subscribe({
      next: (data) => {
        this.games = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching games:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    // Start with all games
    let result = [...this.games];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(game =>
          game.opponent.toLowerCase().includes(term)
      );
    }

    // Apply date range filter
    if (this.startDate) {
      result = result.filter(game => new Date(game.date) >= new Date(this.startDate));
    }

    if (this.endDate) {
      result = result.filter(game => new Date(game.date) <= new Date(this.endDate));
    }

    // Apply competition filter
    if (this.selectedCompetition) {
      result = result.filter(game =>
          this.selectedCompetition === '' || game.competition === this.selectedCompetition as Competition
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (this.selectedStatus === 'upcoming') {
        result = result.filter(game => new Date(game.date) >= today);
      } else if (this.selectedStatus === 'completed') {
        result = result.filter(game => new Date(game.date) < today);
      }
    }

    // Update filtered games
    this.filteredGames = result;

    // Update pagination
    this.totalPages = Math.ceil(this.filteredGames.length / this.gamesPerPage);
    this.currentPage = 1; // Reset to first page when filters change
    this.updateDisplayedGames();
  }

  updateDisplayedGames(): void {
    const startIndex = (this.currentPage - 1) * this.gamesPerPage;
    const endIndex = startIndex + this.gamesPerPage;
    this.displayedGames = this.filteredGames.slice(startIndex, endIndex);
  }

  getCompetitionClass(competition: Competition): string {
    switch(competition) {
      case Competition.BOTOLA_PRO:
        return 'bg-blue-100 text-blue-800';
      case Competition.THRONE_CUP:
        return 'bg-purple-100 text-purple-800';
      case Competition.CAF_SUPER_CUP:
        return 'bg-green-100 text-green-800';
      case Competition.CLUB_WORLD_CUP:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getCompetitionLabel(competition: Competition): string {
    switch(competition) {
      case Competition.BOTOLA_PRO:
        return 'Botola Pro';
      case Competition.THRONE_CUP:
        return 'Throne Cup';
      case Competition.CAF_SUPER_CUP:
        return 'CAF Super Cup';
      case Competition.CLUB_WORLD_CUP:
        return 'Club World Cup';
      default:
        return String(competition).replace('_', ' ');
    }
  }

  getGameStatus(date: string): { status: string, class: string } {
    const gameDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (gameDate >= today) {
      return { status: 'Upcoming', class: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Completed', class: 'bg-red-100 text-red-800' };
    }
  }

  deleteGame(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c1121f',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.gameService.deleteGame(id).subscribe({
          next: () => {
            Swal.fire(
                'Deleted!',
                'Game has been deleted.',
                'success'
            );
            this.games = this.games.filter(game => game.id !== id);
            this.applyFilters();
          },
          error: (err) => {
            console.error('Error deleting game:', err);
            Swal.fire(
                'Error!',
                'There was an error deleting the game.',
                'error'
            );
          }
        });
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedCompetition = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedGames();
    }
  }

  getPaginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  protected readonly Math = Math;
}
