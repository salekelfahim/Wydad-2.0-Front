import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import { CartDTO} from '../../interfaces/cart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {CartItem} from "../../interfaces/cart-item";
import {ProductService} from "../../services/product.service";
import {TicketService} from "../../services/ticket.service";
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cart: CartDTO | null = null;
  isLoading: boolean = true;
  isProcessingAction: boolean = false;
  userId: number | null = null;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userId = user.id;
      this.loadCart();
    } else {
      this.isLoading = false;
      this.errorMessage = 'You must be logged in to view your cart';
      this.router.navigate(['/login']);
    }
  }

  loadCart(): void {
    if (!this.userId) return;

    this.isLoading = true;
    this.resetMessages();

    this.cartService.getCart(this.userId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loadCartItemDetails();
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.errorMessage = 'Could not load your cart. Please try again.';
        this.isLoading = false;
      },
    });
  }

  // Load product and ticket details without setting isLoading flags
  loadCartItemDetails(): void {
    if (!this.cart) {
      this.isLoading = false;
      return;
    }

    // Track the number of pending API calls
    let pendingRequests = 0;

    this.cart.items.forEach((item) => {
      if (item.productId) {
        pendingRequests++;
        this.productService.getProductById(item.productId).subscribe({
          next: (product) => {
            item.product = product;
          },
          error: (err) => {
            console.error('Error loading product details:', err);
          },
          complete: () => {
            pendingRequests--;
            if (pendingRequests === 0) {
              this.isLoading = false;
              this.isProcessingAction = false;
            }
          }
        });
      } else if (item.ticketId) {
        pendingRequests++;
        this.ticketService.getTicketById(item.ticketId).subscribe({
          next: (ticket) => {
            item.ticket = ticket;
          },
          error: (err) => {
            console.error('Error loading ticket details:', err);
          },
          complete: () => {
            pendingRequests--;
            if (pendingRequests === 0) {
              this.isLoading = false;
              this.isProcessingAction = false;
            }
          }
        });
      }
    });

    // If there are no items or no requests were made, finish loading
    if (this.cart.items.length === 0 || pendingRequests === 0) {
      this.isLoading = false;
      this.isProcessingAction = false;
    }
  }

  calculateItemTotal(item: CartItem): number {
    return (item.product?.price || 0) * item.quantity;
  }

  updateQuantity(item: CartItem): void {
    if (!this.userId || !item.id) return;

    this.resetMessages();
    this.isProcessingAction = true; // Set action processing flag

    this.cartService.updateCartItem(this.userId, item.id, { quantity: item.quantity }).subscribe({
      next: (cart) => {
        // Keep reference to existing products/tickets
        const updatedItems = this.mergeCartItems(cart.items);
        cart.items = updatedItems;
        this.cart = cart;
        this.successMessage = 'Cart updated successfully';
        this.isProcessingAction = false;
      },
      error: (err) => {
        console.error('Error updating cart:', err);
        this.errorMessage = 'Could not update cart. Please try again.';
        this.isProcessingAction = false;
      },
    });
  }

  // Helper method to merge existing product/ticket data with updated cart items
  mergeCartItems(newItems: CartItem[]): CartItem[] {
    if (!this.cart) return newItems;

    return newItems.map(newItem => {
      // Find corresponding item in current cart if it exists
      const existingItem = this.cart!.items.find(item => item.id === newItem.id);
      if (existingItem) {
        // Preserve the product/ticket data from existing item
        newItem.product = existingItem.product;
        newItem.ticket = existingItem.ticket;
      }
      return newItem;
    });
  }

  getProductCount(): number {
    if (!this.cart) return 0;
    return this.cart.items.filter(item => item.product).length;
  }

  getTicketCount(): number {
    if (!this.cart) return 0;
    return this.cart.items.filter(item => item.ticket).length;
  }

  removeItem(item: CartItem): void {
    if (!this.userId || !item.id) return;

    this.resetMessages();
    this.isProcessingAction = true; // Flag to show operation in progress

    // Optimistically remove the item from UI first for smoother experience
    if (this.cart) {
      const itemIndex = this.cart.items.findIndex(i => i.id === item.id);
      if (itemIndex !== -1) {
        // Create a new array without the item (immutable update)
        const updatedItems = [
          ...this.cart.items.slice(0, itemIndex),
          ...this.cart.items.slice(itemIndex + 1)
        ];
        this.cart = {
          ...this.cart,
          items: updatedItems
        };
      }
    }

    this.cartService.removeFromCart(this.userId, item.id)
      .pipe(
        finalize(() => {
          this.isProcessingAction = false;
        })
      )
      .subscribe({
        next: (cart) => {
          // Update the cart with merged data to preserve product/ticket info
          const updatedItems = this.mergeCartItems(cart.items);
          cart.items = updatedItems;
          this.cart = cart;
          this.successMessage = 'Item removed from cart';
        },
        error: (err) => {
          console.error('Error removing item:', err);
          this.errorMessage = 'Could not remove item. Please try again.';
          // If there was an error, reload the cart to revert the optimistic update
          this.loadCart();
        }
      });
  }

  clearCart(): void {
    if (!this.userId) return;

    this.resetMessages();
    this.isProcessingAction = true;

    this.cartService.clearCart(this.userId)
      .pipe(
        finalize(() => {
          this.isProcessingAction = false;
        })
      )
      .subscribe({
        next: () => {
          this.cart = { items: [], totalPrice: 0 };
          this.successMessage = 'Cart cleared successfully';
        },
        error: (err) => {
          console.error('Error clearing cart:', err);
          this.errorMessage = 'Could not clear cart. Please try again.';
        },
      });
  }

  checkout(): void {
    if (!this.userId) return;

    this.resetMessages();
    this.isProcessingAction = true;

    this.cartService.checkout(this.userId)
      .pipe(
        finalize(() => {
          this.isProcessingAction = false;
        })
      )
      .subscribe({
        next: () => {
          this.cart = { items: [], totalPrice: 0 };
          this.successMessage = 'Checkout completed successfully';
          setTimeout(() => {
            this.router.navigate(['/order-confirmation']);
          }, 2000);
        },
        error: (err) => {
          console.error('Error during checkout:', err);
          this.errorMessage = 'Checkout failed. Please try again.';
        },
      });
  }

  resetMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getImageUrl(cover: string | undefined): string {
    return `http://localhost:8089${cover}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  calculateProductsSubtotal(): number {
    if (!this.cart) return 0;
    return this.cart.items
      .filter(item => item.product)
      .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  }

  calculateTicketsSubtotal(): number {
    if (!this.cart) return 0;
    return this.cart.items
      .filter(item => item.ticket)
      .reduce((sum, item) => sum + (item.ticket?.price || 0) * item.quantity, 0);
  }

  calculateTotal(): number {
    return this.calculateProductsSubtotal() + this.calculateTicketsSubtotal() + 20;
  }

  get hasNoTickets(): boolean {
    if (!this.cart || this.isLoading) return false;
    return this.cart.items.filter(item => item.ticket).length === 0;
  }
}
