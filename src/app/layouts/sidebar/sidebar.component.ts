import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from "@angular/router";
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentRoute: string = '';
  openSection: string | null = 'dashboard';
  collapsed: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      this.updateOpenSection();
    });

    this.currentRoute = this.router.url;
    this.updateOpenSection();
  }

  updateOpenSection() {
    if (this.currentRoute.includes('/dashboard')) {
      this.openSection = 'dashboard';
    } else if (this.currentRoute.includes('/add-player') || this.currentRoute.includes('/players-list')) {
      this.openSection = 'players';
    } else if (this.currentRoute.includes('/add-product') || this.currentRoute.includes('/products-list')) {
      this.openSection = 'products';
    } else if (this.currentRoute.includes('/add-game') || this.currentRoute.includes('/games-list')) {
      this.openSection = 'games';
    } else if (this.currentRoute.includes('/add-tickets') || this.currentRoute.includes('/tickets-list')) {
      this.openSection = 'tickets';
    } else if (this.currentRoute.includes('/add-news') || this.currentRoute.includes('/news-list')) {
      this.openSection = 'news';
    }
  }

  toggleSection(section: string) {
    this.openSection = this.openSection === section ? null : section;
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  isSectionActive(section: string): boolean {
    switch (section) {
      case 'dashboard':
        return this.currentRoute.includes('/dashboard');
      case 'players':
        return this.currentRoute.includes('/add-player') || this.currentRoute.includes('/players-list');
      case 'products':
        return this.currentRoute.includes('/add-product') || this.currentRoute.includes('/products-list');
      case 'games':
        return this.currentRoute.includes('/add-game') || this.currentRoute.includes('/games-list');
      case 'tickets':
        return this.currentRoute.includes('/add-tickets') || this.currentRoute.includes('/tickets-list');
      case 'news':
        return this.currentRoute.includes('/add-news') || this.currentRoute.includes('/news-list');
      default:
        return false;
    }
  }
}
