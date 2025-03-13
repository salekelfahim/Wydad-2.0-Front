import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {NavbarComponent} from "../../../layouts/navbar/navbar.component";
import {SidebarComponent} from "../../../layouts/sidebar/sidebar.component";
import {DashNavbarComponent} from "../../../layouts/dash-navbar/dash-navbar.component";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    DashNavbarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const userRole = this.authService.getUserRole();
    if (userRole !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }
}
