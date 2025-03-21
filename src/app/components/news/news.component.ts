import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { News } from "../../interfaces/news";
import { NewsService } from "../../services/news.service";

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent implements OnInit {

  allNews: News[] = [];
  filteredNews: News[] = [];
  paginatedNews: News[] = [];

  searchTerm: string = '';
  sortOrder: string = 'newest';

  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 0;

  loading: boolean = true;
  Math = Math;

  constructor(
    private newsService: NewsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.loading = true;
    this.newsService.getAllNews().subscribe({
      next: (data) => {
        this.allNews = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching news', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredNews = this.allNews.filter(news =>
      news.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      news.content.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.sortNews();

    this.calculateTotalPages();
    this.updatePaginatedNews();
  }

  sortNews(): void {
    switch (this.sortOrder) {
      case 'newest':
        this.filteredNews.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case 'oldest':
        this.filteredNews.sort((a, b) => (a.id || 0) - (b.id || 0));
        break;
      case 'titleAsc':
        this.filteredNews.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'titleDesc':
        this.filteredNews.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredNews.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  updatePaginatedNews(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedNews = this.filteredNews.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedNews();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  changeItemsPerPage(): void {
    this.calculateTotalPages();
    this.currentPage = 1;
    this.updatePaginatedNews();
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

      if (endPage - startPage < 2) {
        if (this.currentPage <= 3) {
          endPage = Math.min(4, this.totalPages - 1);
        } else {
          startPage = Math.max(2, this.totalPages - 3);
        }
      }

      if (startPage > 2) {
        pages.push(-1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages - 1) {
        pages.push(-1);
      }

      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  viewNewsDetails(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/news-details', id]);
  }

  getImageUrl(cover: string | undefined): string {
    if (cover) {
      return `http://localhost:8089${cover}`;
    }
    return 'assets/images/default-news.jpg';
  }
}
