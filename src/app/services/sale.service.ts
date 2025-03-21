import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale } from '../interfaces/sale';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = 'http://localhost:8089/api/sales';

  constructor(private http: HttpClient) {}

  /**
   * Get all sales
   */
  getAllSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl);
  }

  /**
   * Get a specific sale by ID
   */
  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new sale
   */
  createSale(sale: Sale): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, sale);
  }

  /**
   * Delete a sale
   */
  deleteSale(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get sales for a specific user (if your backend supports this)
   * Note: This endpoint would need to be added to your Spring backend
   */
  getUserSales(userId: number): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/user/${userId}`);
  }
}
