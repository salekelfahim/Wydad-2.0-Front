import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { AddPlayerComponent } from './components/dashboard/add-player/add-player.component';
import { adminGuard } from './guards/admin.guard';
import { PlayersListComponent } from "./components/dashboard/players-list/players-list.component";
import { EditPlayerComponent } from "./components/dashboard/edit-player/edit-player.component";
import { AddGameComponent } from "./components/dashboard/add-game/add-game.component";
import { AddTicketsComponent } from "./components/dashboard/add-tickets/add-tickets.component";
import { TicketsListComponent } from "./components/dashboard/tickets-list/tickets-list.component";
import { DashboardComponent } from "./components/dashboard/dashboard/dashboard.component";
import { AddProductComponent } from "./components/dashboard/add-product/add-product.component";
import { ProductsListComponent } from "./components/dashboard/products-list/products-list.component";
import { GamesListComponent } from "./components/dashboard/games-list/games-list.component";
import { NewsListComponent } from "./components/dashboard/news-list/news-list.component";
import { AddNewsComponent } from "./components/dashboard/add-news/add-news.component";
import {PlayersComponent} from "./components/players/players.component";

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'Wydad Athletic Club',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'WAC - Register',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'WAC - Login',
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'WAC - Products',
  },
  {
    path: 'details',
    component: ProductDetailsComponent,
    title: 'WAC - Product Details',
  },
  {
    path: 'players',
    component: PlayersComponent,
    title: 'WAC - Players',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'WAC - Dashboard',
    canActivate: [adminGuard],
  },
  {
    path: 'add-player',
    component: AddPlayerComponent,
    title: 'WAC - Add Player',
    canActivate: [adminGuard],
  },
  {
    path: 'players-list',
    component: PlayersListComponent,
    title: 'WAC - Players List',
    canActivate: [adminGuard],
  },
  {
    path: 'edit-player/:id',
    component: EditPlayerComponent,
    title: 'WAC - Edit Player',
    canActivate: [adminGuard],
  },
  {
    path: 'add-game',
    component: AddGameComponent,
    title: 'WAC - Add Game',
    canActivate: [adminGuard],
  },
  {
    path: 'games-list',
    component: GamesListComponent,
    title: 'WAC - Games List',
    canActivate: [adminGuard],
  },
  {
    path: 'add-tickets',
    component: AddTicketsComponent,
    title: 'WAC - Add Tickets',
    canActivate: [adminGuard],
  },
  {
    path: 'tickets-list',
    component: TicketsListComponent,
    title: 'WAC - Tickets List',
    canActivate: [adminGuard],
  },
  {
    path: 'add-product',
    component: AddProductComponent,
    title: 'WAC - Add Product',
    canActivate: [adminGuard],
  },
  {
    path: 'products-list',
    component: ProductsListComponent,
    title: 'WAC - Products List',
    canActivate: [adminGuard],
  },
  {
    path: 'add-news',
    component: AddNewsComponent,
    title: 'WAC - Add News',
    canActivate: [adminGuard],
  },
  {
    path: 'news-list',
    component: NewsListComponent,
    title: 'WAC - News List',
    canActivate: [adminGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
