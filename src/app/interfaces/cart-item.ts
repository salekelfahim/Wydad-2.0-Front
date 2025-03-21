import { Product } from './product';
import { Ticket } from './ticket';

export interface CartItem {
  id?: number;
  productId?: number;
  ticketId?: number;
  product?: Product;
  ticket?: Ticket;
  quantity: number;
}
