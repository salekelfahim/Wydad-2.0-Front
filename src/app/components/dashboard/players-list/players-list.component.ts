import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Player } from "../../../interfaces/player";
import { PlayerService } from "../../../services/player.service";
import { environment } from '../../../environments/environment';

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


  constructor(private playerService: PlayerService) {}

  // ngOnInit(): void {
  //   this.fetchPlayers();
  // }
  //
  // handleImageError(event: any) {
  //   event.target.src = 'https://cdn-icons-png.flaticon.com/256/5281/5281744.png';
  // }
  //
  // fetchPlayers(): void {
  //   this.playerService.getAllPlayers().subscribe({
  //     next: (players) => {
  //       this.players = players;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching players:', error);
  //     },
  //   });
  // }

  ngOnInit(): void {
    this.fetchPlayers();
  }

  fetchPlayers(): void {
    this.playerService.getAllPlayers().subscribe({
      next: (players) => {
        this.players = players;
        console.log('Fetched Players:', players);
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
    event.target.src = 'https://cdn-icons-png.flaticon.com/256/5281/5281744.png'; // Fallback image
  }
}
