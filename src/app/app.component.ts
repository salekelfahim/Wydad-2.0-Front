import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavbarLoggedComponent } from './layouts/navbar-logged/navbar-logged.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { NgIf } from '@angular/common';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { DashNavbarComponent } from './layouts/dash-navbar/dash-navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarLoggedComponent,
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    DashNavbarComponent,
    NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe((authState) => {
      this.isLoggedIn = authState.isLoggedIn;
      this.isAdmin = authState.role === 'ADMIN';
    });

    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.getUserRole() === 'ADMIN';
  }
}
