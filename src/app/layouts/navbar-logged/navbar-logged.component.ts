import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-navbar-logged',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './navbar-logged.component.html',
  styleUrl: './navbar-logged.component.css'
})
export class NavbarLoggedComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  isActive(route: string): boolean {
    return this.router.url === route
  }

  closeDropdown(event: Event): void {
    const detailsElement = (event.target as HTMLElement).closest("details")
    if (detailsElement) {
      detailsElement.open = false
    }
  }
}
