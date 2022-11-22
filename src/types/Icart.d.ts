import { ObjectId } from 'mongodb';

export interface Cart {
    items: CartItem[];
}

export interface CartItem {
    productId?: ObjectId;
    quantity: number;
}
