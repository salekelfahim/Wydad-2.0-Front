import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {Router, RouterModule} from '@angular/router';
import { Player } from "../../../interfaces/player";
import { PlayerService } from "../../../services/player.service";
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css'],
})
export class PlayersListComponent implements OnInit {
  players: Player[] = [];
  environment = environment;
  private backendUrl = 'http://localhost:8089';

  constructor(private playerService: PlayerService, private router: Router) {}

  ngOnInit(): void {
    this.fetchPlayers();
  }

  fetchPlayers(): void {
    this.playerService.getAllPlayers().subscribe({
      next: (players) => {
        this.players = players;
      },
      error: (error) => {
        console.error('Error fetching players:', error);
      },
    });
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
}
