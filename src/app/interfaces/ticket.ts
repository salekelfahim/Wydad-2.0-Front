export enum Category {
  VIP = 'VIP',
  NORMAL = 'NORMAL',
}

export interface Ticket {
  id?: number;
  price: number;
  quantity: number;
  category: Category;
  game: number;
}
