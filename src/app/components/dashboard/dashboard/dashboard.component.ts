import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../../../layouts/navbar/navbar.component";
import { SidebarComponent } from "../../../layouts/sidebar/sidebar.component";
import { DashNavbarComponent } from "../../../layouts/dash-navbar/dash-navbar.component";
import { AuthService, User } from "../../../services/auth.service";
import { PlayerService } from "../../../services/player.service";
import { ProductService } from "../../../services/product.service";
import { GameService } from "../../../services/game.service";
import { NewsService } from "../../../services/news.service";
import { SaleService } from "../../../services/sale.service";
import { Player } from "../../../interfaces/player";
import { Product } from "../../../interfaces/product";
import { Game } from "../../../interfaces/game";
import { News } from "../../../interfaces/news";
import { forkJoin } from 'rxjs';

interface SystemSummary {
  type: 'player' | 'product' | 'game' | 'news' | 'sale';
  icon: string;
  count: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    DashNavbarComponent,
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Statistics
  playerCount: number = 0;
  productCount: number = 0;
  upcomingGamesCount: number = 0;
  newsCount: number = 0;
  totalSales: number = 0;

  // System summaries for the Recent Activities replacement
  systemSummaries: SystemSummary[] = [];

  // Data for display
  currentUser: User | null = null;
  upcomingGames: Game[] = [];

  // Loading state
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private playerService: PlayerService,
    private productService: ProductService,
    private gameService: GameService,
    private newsService: NewsService,
    private saleService: SaleService
  ) {}

  ngOnInit(): void {
    // Check user authorization
    const userRole = this.authService.getUserRole();
    if (userRole !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }

    this.currentUser = this.authService.getUser();

    // Fetch all data in parallel
    forkJoin({
      players: this.playerService.getAllPlayers(),
      products: this.productService.getAllProducts(),
      games: this.gameService.getAllGames(),
      news: this.newsService.getAllNews(),
      sales: this.saleService.getAllSales()
    }).subscribe({
      next: (results) => {
        // Process results
        this.processPlayers(results.players);
        this.processProducts(results.products);
        this.processGames(results.games);
        this.processNews(results.news);
        this.processSales(results.sales);

        // Generate system summaries to replace activity log
        this.generateSystemSummaries(results);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  private processPlayers(players: Player[]): void {
    this.playerCount = players.length;
  }

  private processProducts(products: Product[]): void {
    this.productCount = products.length;
  }

  private processGames(games: Game[]): void {
    // Filter for upcoming games (games with dates in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingGames = games
      .filter(game => {
        const gameDate = new Date(game.date);
        gameDate.setHours(0, 0, 0, 0);
        return gameDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4); // Get only the first 4 upcoming games

    this.upcomingGamesCount = this.upcomingGames.length;
  }

  private processNews(news: News[]): void {
    this.newsCount = news.length;
  }

  private processSales(sales: any[]): void {
    this.totalSales = sales.length;
  }

  private generateSystemSummaries(data: {
    players: Player[],
    products: Product[],
    games: Game[],
    news: News[],
    sales: any[]
  }): void {
    // Create system summaries to replace the activity log
    const summaries: SystemSummary[] = [];

    // Player summary
    if (data.players.length > 0) {
      const positionCounts = this.countPositions(data.players);
      const mostCommonPosition = Object.entries(positionCounts)
        .sort((a, b) => b[1] - a[1])[0];

      summaries.push({
        type: 'player',
        icon: 'group',
        count: data.players.length,
        title: 'Team Roster',
        description: `The team has ${data.players.length} players with ${mostCommonPosition[1]} ${mostCommonPosition[0]}s.`
      });
    }

    // Product summary
    if (data.products.length > 0) {
      // Calculate total inventory value
      const totalValue = data.products.reduce((sum, product) =>
        sum + (product.price * product.quantity), 0);

      summaries.push({
        type: 'product',
        icon: 'shopping_bag',
        count: data.products.length,
        title: 'Store Inventory',
        description: `${data.products.length} products with a total value of ${totalValue.toFixed(2)} MAD.`
      });
    }

    // Game summary
    if (this.upcomingGames.length > 0) {
      const nextGame = this.upcomingGames[0];
      const gameDate = new Date(nextGame.date);
      const today = new Date();

      // Calculate days until next game
      const daysUntil = Math.ceil((gameDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      summaries.push({
        type: 'game',
        icon: 'event',
        count: this.upcomingGamesCount,
        title: 'Next Match',
        description: `Match vs ${nextGame.opponent} in ${daysUntil} days (${nextGame.competition}).`
      });
    } else {
      summaries.push({
        type: 'game',
        icon: 'event',
        count: 0,
        title: 'Upcoming Matches',
        description: 'No upcoming matches scheduled.'
      });
    }

    // News summary
    if (data.news.length > 0) {
      summaries.push({
        type: 'news',
        icon: 'newspaper',
        count: data.news.length,
        title: 'News Articles',
        description: `${data.news.length} news articles published on the website.`
      });
    }

    // Sales summary
    if (data.sales.length > 0) {
      // Count ticket vs merchandise sales
      const ticketSales = data.sales.filter(sale => sale.ticket).length;
      const merchandiseSales = data.sales.filter(sale => sale.product).length;

      summaries.push({
        type: 'sale',
        icon: 'payments',
        count: data.sales.length,
        title: 'Sales Summary',
        description: `${ticketSales} ticket sales and ${merchandiseSales} merchandise sales.`
      });
    }

    this.systemSummaries = summaries;
  }

  private countPositions(players: Player[]): Record<string, number> {
    const positions: Record<string, number> = {};

    players.forEach(player => {
      const position = player.position;
      positions[position] = (positions[position] || 0) + 1;
    });

    return positions;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
