import { Component } from '@angular/core';
import {NavbarComponent} from "../../layouts/navbar/navbar.component";
import {FooterComponent} from "../../layouts/footer/footer.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

}
