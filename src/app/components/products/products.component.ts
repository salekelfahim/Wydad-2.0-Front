import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../layouts/navbar/navbar.component";
import { NavbarLoggedComponent } from "../../layouts/navbar-logged/navbar-logged.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, Size } from '../../interfaces/product';

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

  // Filter properties
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

  // For displaying total count
  get productCount(): number {
    return this.filteredProducts.length;
  }

  // Access Size enum in template
  get sizeEnum() {
    return Size;
  }

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
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

  // Extract all unique product types
  extractAvailableTypes(): void {
    const types = new Set<string>();
    this.products.forEach(product => {
      if (product.type) {
        types.add(product.type);
      }
    });
    this.availableTypes = Array.from(types);
  }

  // Apply all filters
  applyFilters(): void {
    const selectedSizes = this.sizes
      .filter(size => size.checked)
      .map(size => size.value);

    // Convert price from USD to MAD for filtering (since your data is in MAD)
    const minPriceMAD = this.minPrice * 10;
    const maxPriceMAD = this.maxPrice * 10;

    this.filteredProducts = this.products.filter(product => {
      // Filter by price
      const priceMatch = product.price >= minPriceMAD && product.price <= maxPriceMAD;

      // Filter by size
      const sizeMatch = selectedSizes.length === 0 || selectedSizes.includes(product.size);

      // Filter by type
      const typeMatch = this.selectedType === 'all' || product.type === this.selectedType;

      return priceMatch && sizeMatch && typeMatch;
    });
  }

  // Toggle size filter
  toggleSize(size: Size): void {
    const index = this.sizes.findIndex(s => s.value === size);
    if (index !== -1) {
      this.sizes[index].checked = !this.sizes[index].checked;
    }
  }

  // Clear all filters
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

  // Convert price from MAD to display format
  formatPrice(price: number): string {
    return `$${(price / 10).toFixed(2)}`;
  }

  addToCart(product: Product): void {
    console.log('Added to cart:', product);
  }

  quickView(product: Product): void {
    console.log('Quick view:', product);
  }

  toggleFavorite(product: Product): void {
    console.log('Toggled favorite:', product);
  }

  getImageUrl(cover: string | undefined): string {
    if (cover) {
      return `http://localhost:8089${cover}`;
    } else {
      return 'https://cdn-icons-png.flaticon.com/256/5281/5281744.png';
    }
  }
}
