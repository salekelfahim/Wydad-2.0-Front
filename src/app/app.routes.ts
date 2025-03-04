import { Routes } from '@angular/router';
import {LandingComponent} from "./components/landing/landing.component";
import {RegisterComponent} from "./components/auth/register/register.component";
import {LoginComponent} from "./components/auth/login/login.component";
import {ProductsComponent} from "./components/products/products.component";
import {ProductDetailsComponent} from "./components/product-details/product-details.component";

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'Wydad Athletic Club',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'WAC - Register',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'WAC - Login',
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'WAC - Products',
  },
  {
    path: 'details',
    component: ProductDetailsComponent,
    title: 'WAC - Product Details',
  },
];
