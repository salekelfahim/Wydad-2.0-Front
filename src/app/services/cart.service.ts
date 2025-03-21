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

  /**
   * Get cart details for a user
   */
  getCart(userId: number): Observable<CartDTO> {
    return this.http.get<CartDTO>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Add an item to the cart (either product or ticket)
   */
  addToCart(userId: number, request: AddToCartRequest): Observable<CartDTO> {
    return this.http.post<CartDTO>(`${this.apiUrl}/${userId}/items`, request);
  }

  /**
   * Update the quantity of a cart item
   */
  updateCartItem(userId: number, itemId: number, request: UpdateCartItemRequest): Observable<CartDTO> {
    return this.http.put<CartDTO>(`${this.apiUrl}/${userId}/items/${itemId}`, request);
  }

  /**
   * Remove an item from the cart
   */
  removeFromCart(userId: number, itemId: number): Observable<CartDTO> {
    return this.http.delete<CartDTO>(`${this.apiUrl}/${userId}/items/${itemId}`);
  }

  /**
   * Clear all items from the cart
   */
  clearCart(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Process checkout for the cart
   */
  checkout(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/checkout`, {});
  }

  /**
   * Helper method to add a product to cart
   */
  addProductToCart(userId: number, productId: number, quantity: number): Observable<CartDTO> {
    const request: AddToCartRequest = {
      productId: productId,
      quantity: quantity
    };
    return this.addToCart(userId, request);
  }

  /**
   * Helper method to add a ticket to cart
   */
  addTicketToCart(userId: number, ticketId: number, quantity: number): Observable<CartDTO> {
    const request: AddToCartRequest = {
      ticketId: ticketId,
      quantity: quantity
    };
    return this.addToCart(userId, request);
  }
}
