import { Product } from './Iproduct';
import mongodb from 'mongodb';

export interface Cart {
    items: CartItem[];
}

export interface CartItem {
    _id?: mongodb.ObjectId;
    productId?: number | mongodb.ObjectId;
    quantity: number;
}
