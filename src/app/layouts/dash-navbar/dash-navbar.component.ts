import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dash-navbar',
  standalone: true,
  imports: [],
  templateUrl: './dash-navbar.component.html',
  styleUrl: './dash-navbar.component.css'
})
export class DashNavbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
