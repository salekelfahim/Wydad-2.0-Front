import { Component } from '@angular/core';
import {NavbarLoggedComponent} from "../../layouts/navbar-logged/navbar-logged.component";

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    NavbarLoggedComponent
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {

}
