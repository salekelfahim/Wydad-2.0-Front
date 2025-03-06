import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {NavbarComponent} from "../../../layouts/navbar/navbar.component";
import {SidebarComponent} from "../../../layouts/sidebar/sidebar.component";
import {DashNavbarComponent} from "../../../layouts/dash-navbar/dash-navbar.component";

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
export class DashboardComponent {

}
