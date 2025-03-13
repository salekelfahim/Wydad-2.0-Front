import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../../services/news.service';
import { News } from '../../../interfaces/news';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-news',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.css'],
})
export class AddNewsComponent implements OnInit {
  newsForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private router: Router
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(100000)]],
    });
  }

  ngOnInit(): void {
    const titleInput = document.getElementById('newsTitle');
    const contentTextarea = document.getElementById('newsContent');

    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const charCount = document.getElementById('charCount');
        if (charCount) {
          charCount.textContent = target.value.length.toString();
        }
        this.newsForm.patchValue({ title: target.value });
      });
    }

    if (contentTextarea) {
      contentTextarea.addEventListener('input', (e) => {
        const target = e.target as HTMLTextAreaElement;
        const charCount = document.getElementById('contentCharCount');
        if (charCount) {
          charCount.textContent = target.value.length.toString();
        }
        this.newsForm.patchValue({ content: target.value });
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'File Too Large',
          text: 'Please select an image less than 5MB.',
          icon: 'error',
          confirmButtonColor: '#c1121f'
        });
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          title: 'Invalid File Type',
          text: 'Please select a JPG, PNG, GIF, or WebP image.',
          icon: 'error',
          confirmButtonColor: '#c1121f'
        });
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        const previewContainer = document.getElementById('imagePreviewContainer');
        const imagePreviewElement = document.getElementById('imagePreview') as HTMLImageElement;

        if (previewContainer && imagePreviewElement && this.imagePreview) {
          previewContainer.classList.remove('hidden');
          imagePreviewElement.src = this.imagePreview;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer) {
      previewContainer.classList.add('hidden');
    }
  }

  saveDraft(): void {
    Swal.fire({
      title: 'Draft Saved',
      text: 'Your article has been saved as a draft.',
      icon: 'success',
      confirmButtonColor: '#c1121f'
    });
  }

  preview(): void {
    Swal.fire({
      title: 'Preview',
      text: 'Preview functionality is not yet implemented.',
      icon: 'info',
      confirmButtonColor: '#c1121f'
    });
  }

  onSubmit(): void {
    if (this.newsForm.invalid || !this.selectedFile) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill out all required fields and upload a cover image.',
        icon: 'error',
        confirmButtonColor: '#c1121f'
      });
      return;
    }

    this.isSubmitting = true;

    const news: News = {
      title: this.newsForm.get('title')?.value,
      content: this.newsForm.get('content')?.value,
    };

    this.newsService.createNews(news, this.selectedFile).subscribe({
      next: (response) => {
        console.log('News created successfully:', response);

        Swal.fire({
          title: 'Success!',
          text: 'Article published successfully',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/news-list']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating news:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to publish article',
          icon: 'error',
          confirmButtonColor: '#c1121f'
        });
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/news-list']);
  }
}
