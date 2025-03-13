export enum Size {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  One_Size = 'One_Size'
}

export interface Product {
  id?: number;
  name: string;
  type: string;
  quantity: number;
  price: number;
  picture?: string;
  size: Size;
}
