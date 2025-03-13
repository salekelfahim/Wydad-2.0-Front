import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";
import { FooterComponent } from "../../layouts/footer/footer.component";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { PlayerService } from "../../services/player.service";
import { GameService } from "../../services/game.service";
import { ProductService } from "../../services/product.service";
import { Player } from "../../interfaces/player";
import { Game } from "../../interfaces/game";
import { Product } from "../../interfaces/product";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    CommonModule,
    RouterLink
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  players: Player[] = [];
  products: Product[] = [];
  games: Game[] = [];
  loading = {
    players: true,
    products: true,
    games: true
  };
  error = {
    players: false,
    products: false,
    games: false
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private playerService: PlayerService,
    private gameService: GameService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const userRole = this.authService.getUserRole();
    if (userRole === 'ADMIN') {
      this.router.navigate(['/dashboard']);
    }

    // Fetch players
    this.playerService.getAllPlayers().subscribe({
      next: (data) => {
        this.players = data.slice(0, 6); // Get first 6 players
        this.loading.players = false;
      },
      error: (err) => {
        console.error('Error fetching players:', err);
        this.loading.players = false;
        this.error.players = true;
      }
    });

    // Fetch products
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data.slice(0, 4); // Get first 4 products
        this.loading.products = false;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.loading.products = false;
        this.error.products = true;
      }
    });

    // Fetch games
    this.gameService.getAllGames().subscribe({
      next: (data) => {
        this.games = data.slice(0, 3); // Get first 3 games
        this.loading.games = false;
      },
      error: (err) => {
        console.error('Error fetching games:', err);
        this.loading.games = false;
        this.error.games = true;
      }
    });
  }

  // Helper method to format date from ISO string
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getImageUrl(cover: string | undefined): string {
    if (cover) {
      return `http://localhost:8089${cover}`;
    } else {
      return 'https://cdn-icons-png.flaticon.com/256/5281/5281744.png';
    }
  }
}
