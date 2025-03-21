import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { Product, Size } from '../../../interfaces/product';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isSubmitting = false;
  sizes = Object.values(Size);
  showPreview = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      size: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.showPreview = true;
      };
      reader.readAsDataURL(file);
    }
  }

  clearFileSelection(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.showPreview = false;
  }

  onSubmit(): void {
    if (this.productForm.invalid || !this.selectedFile) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill out all required fields and upload a product image.',
        icon: 'error',
        confirmButtonColor: '#c1121f'
      });
      return;
    }

    this.isSubmitting = true;

    const product: Product = {
      name: this.productForm.value.name,
      type: this.productForm.value.type,
      size: this.productForm.value.size,
      quantity: this.productForm.value.quantity,
      price: this.productForm.value.price
    };

    this.productService.createProduct(product, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Product created successfully:', response);

        Swal.fire({
          title: 'Success!',
          text: 'Product added successfully',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/products-list']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to create product. Please try again.',
          icon: 'error',
          confirmButtonColor: '#c1121f'
        });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products-list']);
  }
}
