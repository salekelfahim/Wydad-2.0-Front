import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, Size } from "../../../interfaces/product";
import { ProductService } from "../../../services/product.service";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import Swal from "sweetalert2";

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export class ProductsListComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  loading = true;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 8;
  totalPages = 1;

  // Search and filters
  searchTerm = '';
  filterType = '';
  filterSize = '';
  filterPriceMin: number | null = null;
  filterPriceMax: number | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  applyFilters(): void {
    // First apply search and filters
    this.filteredProducts = this.allProducts.filter(product => {
      // Search term filter
      const matchesSearch = !this.searchTerm ||
          product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          product.type.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Product type filter
      const matchesType = !this.filterType || product.type === this.filterType;

      // Size filter
      const matchesSize = !this.filterSize || product.size === this.filterSize;

      // Price range filter
      const matchesMinPrice = !this.filterPriceMin || product.price >= this.filterPriceMin;
      const matchesMaxPrice = !this.filterPriceMax || product.price <= this.filterPriceMax;

      return matchesSearch && matchesType && matchesSize && matchesMinPrice && matchesMaxPrice;
    });

    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);

    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }

    // Then paginate
    this.paginate();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedProducts = this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginate();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }

  search(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterType = '';
    this.filterSize = '';
    this.filterPriceMin = null;
    this.filterPriceMax = null;
    this.currentPage = 1;
    this.applyFilters();
  }

  getSizeDisplayText(size: Size): string {
    if (size === Size.One_Size) {
      return 'One Size';
    }
    return size;
  }

  getImageUrl(cover: string | undefined): string {
      return `http://localhost:8089${cover}`;
  }

  deleteProduct(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c1121f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.allProducts = this.allProducts.filter(product => product.id !== id);
            this.applyFilters();

            Swal.fire({
              title: 'Deleted!',
              text: 'Your product has been deleted.',
              icon: 'success',
              confirmButtonColor: '#c1121f',
            });
          },
          error: (err) => {
            console.error('Error deleting product:', err);

            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete product. Please try again.',
              icon: 'error',
              confirmButtonColor: '#c1121f',
            });
          },
        });
      }
    });
  }

}
