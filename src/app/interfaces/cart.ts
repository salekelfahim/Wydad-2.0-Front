import { CartItem } from './cart-item';
import {User} from "../services/auth.service";

export interface Cart {
  id?: number;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
  items: CartItem[];
}

export interface CartDTO {
  id?: number;
  userId?: number;
  items: CartItem[];
  totalPrice: number;
}
