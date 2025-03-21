import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Player} from "../../../interfaces/player";
import { PlayerService } from "../../../services/player.service";
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css'],
})
export class PlayersListComponent implements OnInit {
  players: Player[] = [];
  filteredPlayers: Player[] = [];
  displayedPlayers: Player[] = [];
  environment = environment;
  private backendUrl = 'http://localhost:8089';

  searchTerm: string = '';

  positionFilters = {
    GOALKEEPER: false,
    DEFENDER: false,
    MIDFIELDER: false,
    ATTACKER: false
  };

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  sortField: 'name' | 'position' | 'age' | 'number' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private playerService: PlayerService, private router: Router) {}

  ngOnInit(): void {
    this.fetchPlayers();
  }

  fetchPlayers(): void {
    this.playerService.getAllPlayers().subscribe({
      next: (players) => {
        this.players = players;
        this.applyFiltersAndSearch();
      },
      error: (error) => {
        console.error('Error fetching players:', error);
      },
    });
  }

  applyFiltersAndSearch(): void {
    let result = this.players;

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(player =>
        player.firstName.toLowerCase().includes(searchLower) ||
        player.lastName.toLowerCase().includes(searchLower)
      );
    }

    const anyFilterSelected = Object.values(this.positionFilters).some(value => value);

    if (anyFilterSelected) {
      result = result.filter(player => {
        return this.positionFilters[player.position as keyof typeof this.positionFilters];
      });
    }

    result = this.sortPlayers(result);

    this.filteredPlayers = result;

    this.totalPages = Math.ceil(this.filteredPlayers.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    this.updateDisplayedPlayers();
  }

  sortPlayers(players: Player[]): Player[] {
    return [...players].sort((a, b) => {
      let comparison = 0;

      if (this.sortField === 'name') {
        const aName = `${a.firstName} ${a.lastName}`;
        const bName = `${b.firstName} ${b.lastName}`;
        comparison = aName.localeCompare(bName);
      } else if (this.sortField === 'position') {
        comparison = a.position.localeCompare(b.position);
      } else if (this.sortField === 'number') {
        comparison = a.number - b.number;
      } else if (this.sortField === 'age') {
        const aDate = new Date(a.birthday);
        const bDate = new Date(b.birthday);
        comparison = aDate.getTime() - bDate.getTime();
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  updateDisplayedPlayers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredPlayers.length);
    this.displayedPlayers = this.filteredPlayers.slice(startIndex, endIndex);
  }

  getPositionClass(position: string): string {
    switch (position) {
      case 'GOALKEEPER':
        return 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800';
      case 'DEFENDER':
        return 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800';
      case 'MIDFIELDER':
        return 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800';
      case 'ATTACKER':
        return 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800';
      default:
        return 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800';
    }
  }

  getImageUrl(picturePath: string): string {
    return `http://localhost:8089${picturePath}`;
  }

  handleImageError(event: any, player: Player): void {
    console.error(`Failed to load image for player ${player.firstName} ${player.lastName}`);
    event.target.src = 'https://cdn-icons-png.flaticon.com/256/5281/5281744.png';
  }

  confirmDelete(player: Player): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${player.firstName} ${player.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c1121f',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deletePlayer(player.id!);
      }
    });
  }

  deletePlayer(id: number): void {
    this.playerService.deletePlayer(id).subscribe({
      next: () => {
        this.players = this.players.filter(player => player.id !== id);
        this.applyFiltersAndSearch();

        Swal.fire({
          title: 'Deleted!',
          text: 'Player has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error deleting player:', error);
        Swal.fire('Error', 'Failed to delete player', 'error');
      }
    });
  }

  navigateToEdit(playerId: number): void {
    this.router.navigate(['/edit-player', playerId]);
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.applyFiltersAndSearch();
  }

  togglePositionFilter(position: keyof typeof this.positionFilters): void {
    this.positionFilters[position] = !this.positionFilters[position];
    this.currentPage = 1;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.applyFiltersAndSearch();
  }

  clearFilters(): void {
    Object.keys(this.positionFilters).forEach(key => {
      this.positionFilters[key as keyof typeof this.positionFilters] = false;
    });
    this.currentPage = 1;
    this.applyFiltersAndSearch();
  }

  changeSortField(field: 'name' | 'position' | 'age' | 'number'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSearch();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPlayers();
    }
  }

  getPaginationRange(): number[] {
    const range = [];
    const maxPagesToShow = 5;

    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }

  protected readonly Math = Math;
}
