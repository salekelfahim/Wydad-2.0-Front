import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartDTO } from '../interfaces/cart';
import { AddToCartRequest } from '../interfaces/add-to-cart-request';
import { UpdateCartItemRequest } from '../interfaces/update-cart-request';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8089/api/cart';

  constructor(private http: HttpClient) {}

  getCart(userId: number): Observable<CartDTO> {
    return this.http.get<CartDTO>(`${this.apiUrl}/${userId}`);
  }

  addToCart(userId: number, request: AddToCartRequest): Observable<CartDTO> {
    return this.http.post<CartDTO>(`${this.apiUrl}/${userId}/items`, request);
  }

  updateCartItem(userId: number, itemId: number, request: UpdateCartItemRequest): Observable<CartDTO> {
    return this.http.put<CartDTO>(`${this.apiUrl}/${userId}/items/${itemId}`, request);
  }

  removeFromCart(userId: number, itemId: number): Observable<CartDTO> {
    return this.http.delete<CartDTO>(`${this.apiUrl}/${userId}/items/${itemId}`);
  }

  clearCart(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  checkout(userId: number): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/${userId}/checkout`,
      {},
      { responseType: 'text' as 'json' }
    );
  }

  addProductToCart(userId: number, productId: number, quantity: number): Observable<CartDTO> {
    const request: AddToCartRequest = {
      productId: productId,
      quantity: quantity
    };
    return this.addToCart(userId, request);
  }

  addTicketToCart(userId: number, ticketId: number, quantity: number): Observable<CartDTO> {
    const request: AddToCartRequest = {
      ticketId: ticketId,
      quantity: quantity
    };
    return this.addToCart(userId, request);
  }
}
