import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { News } from '../interfaces/news';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl = 'http://localhost:8089/api/news';

  constructor(private http: HttpClient) {}

  createNews(news: News, image: File): Observable<News> {
    const formData = new FormData();
    formData.append('news', new Blob([JSON.stringify(news)], { type: 'application/json' }));
    formData.append('image', image, image.name);
    return this.http.post<News>(`${this.apiUrl}`, formData);
  }

  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(this.apiUrl);
  }

  getNewsById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`);
  }

  updateNews(id: number, news: News, image: File | null): Observable<News> {
    const formData = new FormData();
    formData.append('news', new Blob([JSON.stringify(news)], { type: 'application/json' }));

    if (image) {
      formData.append('image', image, image.name);
    }

    return this.http.put<News>(`${this.apiUrl}/${id}`, formData);
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
