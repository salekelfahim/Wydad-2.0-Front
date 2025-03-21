import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { News } from '../../interfaces/news';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-details.component.html',
  styleUrl: './news-details.component.css'
})
export class NewsDetailsComponent implements OnInit {
  news: News | null = null;
  loading: boolean = true;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadNewsDetails(id);
      } else {
        this.router.navigate(['/news']);
      }
    });
  }

  loadNewsDetails(id: number): void {
    this.loading = true;
    this.newsService.getNewsById(id).subscribe({
      next: (data) => {
        this.news = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching news details', error);
        this.loading = false;
        this.router.navigate(['/news']);
      }
    });
  }

  getImageUrl(cover: string | undefined): string {
    if (cover) {
      return `http://localhost:8089${cover}`;
    }
    return 'assets/images/default-news.jpg';
  }

  goBack(): void {
    this.router.navigate(['/news']);
  }
}
