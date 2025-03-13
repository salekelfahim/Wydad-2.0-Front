import {Component, OnInit} from '@angular/core';
import {NewsService} from '../../../services/news.service';
import {News} from '../../../interfaces/news';
import Swal from 'sweetalert2';
import {NgForOf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink
  ],
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements OnInit {
  newsList: News[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.newsService.getAllNews().subscribe({
      next: (data) => {
        console.log('Raw API response:', data);
        this.newsList = data;
      },
      error: (error) => {
        console.error('Error fetching news:', error);
      }
    });
  }

  getImageUrl(cover: string | undefined): string {
    if (cover) {
      return `http://localhost:8089${cover}`;
    } else {
      return 'https://cdn-icons-png.flaticon.com/256/5281/5281744.png';
    }
  }

  deleteNews(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this news item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c1121f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.newsService.deleteNews(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The news item has been deleted.', 'success');
            this.loadNews();
          },
          error: (error) => {
            console.error('Error deleting news:', error);
            Swal.fire('Error!', 'Failed to delete the news item.', 'error');
          }
        });
      }
    });
  }
}
