import { Component } from '@angular/core';
import {NavbarComponent} from "../../layouts/navbar/navbar.component";
import {NavbarLoggedComponent} from "../../layouts/navbar-logged/navbar-logged.component";

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    NavbarComponent,
    NavbarLoggedComponent
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

}
