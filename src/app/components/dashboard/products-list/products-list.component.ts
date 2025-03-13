import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Product, Size} from "../../../interfaces/product";
import {ProductService} from "../../../services/product.service";
import {RouterModule} from "@angular/router";


@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  getSizeDisplayText(size: Size): string {
    if (size === Size.One_Size) {
      return 'One Size';
    }
    return size;
  }

  getImageUrl(cover: string | undefined): string {
    if (cover) {
      return `http://localhost:8089${cover}`;
    } else {
      return 'https://cdn-icons-png.flaticon.com/256/5281/5281744.png';
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(product => product.id !== id);
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }
}
