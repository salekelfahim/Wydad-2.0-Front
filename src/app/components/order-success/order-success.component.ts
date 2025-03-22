import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../interfaces/cart-item';

interface OrderSummary {
  orderNumber: string;
  items: CartItem[];
  total: number;
  date: string;
  shipping: number;
}

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.component.html',
})
export class OrderSuccessComponent implements OnInit {
  order: OrderSummary | null = null;

  ngOnInit(): void {
    const orderData = localStorage.getItem('lastOrder');
    if (orderData) {
      this.order = JSON.parse(orderData);
    }
  }

  getProductCount(): number {
    if (!this.order) return 0;
    return this.order.items.filter(item => item.product).length;
  }

  getTicketCount(): number {
    if (!this.order) return 0;
    return this.order.items.filter(item => item.ticket).length;
  }

  calculateProductsSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items
      .filter(item => item.product)
      .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  }

  calculateTicketsSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items
      .filter(item => item.ticket)
      .reduce((sum, item) => sum + (item.ticket?.price || 0) * item.quantity, 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getImageUrl(cover: string | undefined): string {
    return `http://localhost:8089${cover}`;
  }
}
