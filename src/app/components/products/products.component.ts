import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";
import { NavbarLoggedComponent } from "../../layouts/navbar-logged/navbar-logged.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, Size } from '../../interfaces/product';
import { Router } from '@angular/router';

// Import SweetAlert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    NavbarComponent,
    NavbarLoggedComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  error: string | null = null;

  isLoggedIn: boolean = false;
  userId: number | null = null;

  sizes: { value: Size, checked: boolean }[] = [
    { value: Size.S, checked: false },
    { value: Size.M, checked: false },
    { value: Size.L, checked: false },
    { value: Size.XL, checked: false },
    { value: Size.One_Size, checked: false }
  ];

  minPrice = 25;
  maxPrice = 100;
  selectedType: string = 'all';
  availableTypes: string[] = [];

  get productCount(): number {
    return this.filteredProducts.length;
  }

  get sizeEnum() {
    return Size;
  }

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

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

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...data];
        this.extractAvailableTypes();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  extractAvailableTypes(): void {
    const types = new Set<string>();
    this.products.forEach(product => {
      if (product.type) {
        types.add(product.type);
      }
    });
    this.availableTypes = Array.from(types);
  }

  applyFilters(): void {
    const selectedSizes = this.sizes
      .filter(size => size.checked)
      .map(size => size.value);

    const minPriceMAD = this.minPrice * 10;
    const maxPriceMAD = this.maxPrice * 10;

    this.filteredProducts = this.products.filter(product => {
      const priceMatch = product.price >= minPriceMAD && product.price <= maxPriceMAD;

      const sizeMatch = selectedSizes.length === 0 || selectedSizes.includes(product.size);

      const typeMatch = this.selectedType === 'all' || product.type === this.selectedType;

      return priceMatch && sizeMatch && typeMatch;
    });
  }

  toggleSize(size: Size): void {
    const index = this.sizes.findIndex(s => s.value === size);
    if (index !== -1) {
      this.sizes[index].checked = !this.sizes[index].checked;
    }
  }

  clearAllFilters(): void {
    this.sizes.forEach(size => size.checked = false);
    this.minPrice = 25;
    this.maxPrice = 100;
    this.selectedType = 'all';
    this.filteredProducts = [...this.products];
  }

  scrollToProducts(): void {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  formatPrice(price: number): string {
    return `$${(price / 10).toFixed(2)}`;
  }

  isSoldOut(product: Product): boolean {
    return product.quantity <= 0;
  }

  addToCart(product: Product): void {
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

    if (product.quantity < 1) {
      Swal.fire({
        title: 'Out of Stock',
        text: 'This product is currently sold out',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#c1121f'
      });
      return;
    }

    this.cartService.addProductToCart(this.userId, product.id!, 1).subscribe({
      next: (cart) => {
        Swal.fire({
          title: 'Success!',
          text: `${product.name} added to your cart!`,
          icon: 'success',
          confirmButtonText: 'Continue Shopping',
          confirmButtonColor: '#c1121f',
          showCancelButton: true,
          cancelButtonText: 'View Cart',
          cancelButtonColor: '#333'
        }).then((result) => {
          if (!result.isConfirmed) {
            this.router.navigate(['/cart']);
          }
        });
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        Swal.fire({
          title: 'Error',
          text: 'Could not add item to cart. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#c1121f'
        });
      }
    });
  }

  toggleFavorite(product: Product): void {
    console.log('Toggled favorite:', product);
  }

  getImageUrl(cover: string | undefined): string {
    return `http://localhost:8089${cover}`;
  }

  quickView(product: Product): void {
    this.router.navigate(['/product-details', product.id]);
  }
}
