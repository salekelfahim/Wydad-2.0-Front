import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import {Competition, Game} from "../../../interfaces/game";
import {GameService} from "../../../services/game.service";

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.css'
})
export class GamesListComponent implements OnInit {
  games: Game[] = [];
  loading = true;
  error = false;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.loading = true;
    this.gameService.getAllGames().subscribe({
      next: (data) => {
        this.games = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching games:', err);
        this.error = true;
        this.loading = false;
      }
    });
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
        return 'League';
      case Competition.THRONE_CUP:
        return 'Cup';
      default:
        return competition.replace('_', ' ');
    }
  }

  deleteGame(id: number): void {
    if (confirm('Are you sure you want to delete this game?')) {
      this.gameService.deleteGame(id).subscribe({
        next: () => {
          this.games = this.games.filter(game => game.id !== id);
        },
        error: (err) => {
          console.error('Error deleting game:', err);
        }
      });
    }
  }
}
