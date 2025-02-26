import { Component } from '@angular/core';
import {FooterComponent} from "../../../layouts/footer/footer.component";
import {NavbarComponent} from "../../../layouts/navbar/navbar.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FooterComponent,
    NavbarComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}
