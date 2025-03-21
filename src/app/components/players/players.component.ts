import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgForOf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PlayerService } from "../../services/player.service";
import { Player } from "../../interfaces/player";

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    CommonModule,
  ],
  styleUrls: ['./players.component.scss']
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  filteredPlayers: Player[] = [];
  displayedPlayers: Player[] = [];
  searchTerm: string = '';
  selectedPosition: string = '';
  selectedNationality: string = '';
  sortCriteria: string = 'Name (A-Z)';
  availableNationalities: string[] = [];

  // Pagination properties
  currentPage: number = 1;
  playersPerPage: number = 12;
  totalPages: number = 1;
  paginationRange: number[] = [];

  // Track dropdown states
  positionDropdownOpen: boolean = false;
  nationalityDropdownOpen: boolean = false;
  sortDropdownOpen: boolean = false;

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.playerService.getAllPlayers().subscribe(
      (data) => {
        this.players = data;
        this.filteredPlayers = [...this.players];
        this.extractNationalities();
        this.applyFilters(); // Apply default sorting immediately
      },
      (error) => {
        console.error('Error fetching players:', error);
      }
    );
  }

  extractNationalities(): void {
    this.availableNationalities = [...new Set(this.players.map(player => player.nationality))];
  }

  togglePositionDropdown(): void {
    this.positionDropdownOpen = !this.positionDropdownOpen;
    this.nationalityDropdownOpen = false;
    this.sortDropdownOpen = false;
  }

  toggleNationalityDropdown(): void {
    this.nationalityDropdownOpen = !this.nationalityDropdownOpen;
    this.positionDropdownOpen = false;
    this.sortDropdownOpen = false;
  }

  toggleSortDropdown(): void {
    this.sortDropdownOpen = !this.sortDropdownOpen;
    this.positionDropdownOpen = false;
    this.nationalityDropdownOpen = false;
  }

  filterByPosition(position: string): void {
    this.selectedPosition = position;
    this.positionDropdownOpen = false;
    this.currentPage = 1; // Reset to first page when filter changes
    this.applyFilters();
  }

  filterByNationality(nationality: string): void {
    this.selectedNationality = nationality;
    this.nationalityDropdownOpen = false;
    this.currentPage = 1; // Reset to first page when filter changes
    this.applyFilters();
  }

  sortPlayers(criteria: string): void {
    switch (criteria) {
      case 'name-asc':
        this.sortCriteria = 'Name (A-Z)';
        break;
      case 'name-desc':
        this.sortCriteria = 'Name (Z-A)';
        break;
      case 'number-asc':
        this.sortCriteria = 'Jersey Number (Low-High)';
        break;
      case 'number-desc':
        this.sortCriteria = 'Jersey Number (High-Low)';
        break;
    }
    this.sortDropdownOpen = false;
    this.applyFilters();
  }

  applyFilters(): void {
    // Start with all players
    let result = [...this.players];

    // Apply search filter
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(player =>
        `${player.firstName} ${player.lastName}`.toLowerCase().includes(term)
      );
    }

    // Apply position filter
    if (this.selectedPosition) {
      // Convert displayed position to match backend enum values
      let backendPosition;
      switch (this.selectedPosition) {
        case 'Goalkeeper':
          backendPosition = 'GOALKEEPER';
          break;
        case 'Defender':
          backendPosition = 'DEFENDER';
          break;
        case 'Midfielder':
          backendPosition = 'MIDFIELDER';
          break;
        case 'Forward':
          backendPosition = 'ATTACKER';
          break;
        default:
          backendPosition = this.selectedPosition; // In case it's already uppercase
      }

      result = result.filter(player =>
        player.position.toUpperCase() === backendPosition
      );
    }

    // Apply nationality filter
    if (this.selectedNationality) {
      result = result.filter(player => player.nationality === this.selectedNationality);
    }

    // Apply sorting
    switch (this.sortCriteria) {
      case 'Name (A-Z)':
        result.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
        break;
      case 'Name (Z-A)':
        result.sort((a, b) => `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`));
        break;
      case 'Jersey Number (Low-High)':
        result.sort((a, b) => a.number - b.number);
        break;
      case 'Jersey Number (High-Low)':
        result.sort((a, b) => b.number - a.number);
        break;
    }

    this.filteredPlayers = result;
    this.updatePagination();
  }

  updatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredPlayers.length / this.playersPerPage);

    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    // Calculate pagination range (show up to 5 page numbers)
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Create page number array
    this.paginationRange = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    // Get current page of players
    const startIndex = (this.currentPage - 1) * this.playersPerPage;
    this.displayedPlayers = this.filteredPlayers.slice(startIndex, startIndex + this.playersPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  searchPlayers(): void {
    this.currentPage = 1; // Reset to first page when search changes
    this.applyFilters();
  }

  calculateAge(birthdate: string): number {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getFlagUrl(nationality: string): string {
    const countryCode = this.getCountryCode(nationality);
    return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
  }

  private getCountryCode(nationality: string): string {
    const countryMap: {[key: string]: string} = {
      'Morocco': 'ma',
      'Senegal': 'sn',
      'Ivory Coast': 'ci',
      'Mali': 'ml',
    };

    return countryMap[nationality] || 'xx'; // Return 'xx' for unknown countries
  }

  getImageUrl(picturePath: string): string {
    return `http://localhost:8089${picturePath}`;
  }

  handleImageError(event: any, player: Player): void {
    console.error(`Failed to load image for player ${player.firstName} ${player.lastName}`);
    event.target.src = 'https://cdn-icons-png.flaticon.com/256/5281/5281744.png';
  }

    protected readonly Math = Math;
}
