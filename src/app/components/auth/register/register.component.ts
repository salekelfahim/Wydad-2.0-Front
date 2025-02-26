import { Component } from '@angular/core';
import {NavbarComponent} from "../../../layouts/navbar/navbar.component";
import {FooterComponent} from "../../../layouts/footer/footer.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

}
