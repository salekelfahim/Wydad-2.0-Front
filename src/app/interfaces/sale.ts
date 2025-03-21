import { Product } from './product';
import { Ticket } from './ticket';
import {User} from "../services/auth.service";

export interface Sale {
  id?: number;
  user?: User;
  product?: Product;
  ticket?: Ticket;
  quantity: number;
  date?: Date;
}
