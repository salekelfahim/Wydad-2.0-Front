export enum Category {
  VIP = 'VIP',
  NORMAL = 'NORMAL',
}

export interface Ticket {
  id?: number;
  price: number;
  quantity: number;
  category: Category;
  game: {
    id: number;
    date?: string;
    time?: string;
    opponent?: string;
    competition?: string;
  };
}
