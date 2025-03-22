import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../interfaces/product';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from "sweetalert2";

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  quantity: number = 1;
  isLoggedIn: boolean = false;
  userId: number | null = null;
  successMessage: string = '';
  errorMessage: string = '';

  staticDescription =
    "The official 2024/25 Wydad Athletic Club home jersey combines traditional team colors with modern performance technology. Designed with the passionate Wydad fan in mind, this jersey represents the proud legacy of one of Morocco's most storied football clubs.";

  staticSpecifications = [
    { key: "Material", value: "100% Polyester with DryCool technology" },
    { key: "Fit", value: "Regular fit" },
    { key: "Care", value: "Machine wash cold, do not bleach, tumble dry low" },
    { key: "Origin", value: "Imported" },
    { key: "Season", value: "2024/25" },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    }

    this.authService.authState$.subscribe(state => {
      this.isLoggedIn = state.isLoggedIn;
      if (this.isLoggedIn) {
        const user = this.authService.getUser();
        if (user) {
          this.userId = user.id;
        }
      }
    });
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loadRelatedProducts();
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.errorMessage = 'Could not load product details.';
      },
    });
  }

  loadRelatedProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.relatedProducts = products.slice(0, 4);
      },
      error: (err) => {
        console.error('Error loading related products:', err);
      },
    });
  }

  addToCart(): void {
    this.resetMessages();

    if (!this.isLoggedIn || !this.userId) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You must be logged in to add items to the cart',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Register',
        confirmButtonColor: '#c1121f',
        cancelButtonColor: '#333'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.router.navigate(['/register']);
        }
      });
      return;
    }

    if (this.quantity < 1) {
      this.errorMessage = 'Quantity must be at least 1';
      return;
    }

    if (this.product && this.product.quantity < this.quantity) {
      this.errorMessage = 'Not enough stock available';
      return;
    }

    if (this.product && this.userId) {
      this.cartService.addProductToCart(this.userId, this.product.id!, this.quantity).subscribe({
        next: (cart) => {
          this.successMessage = `${this.product!.name} added to your cart!`;
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          this.errorMessage = 'Could not add item to cart. Please try again.';
        },
      });
    }
  }

  resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getImageUrl(cover: string | undefined): string {
    return `http://localhost:8089${cover}`;
  }
}
