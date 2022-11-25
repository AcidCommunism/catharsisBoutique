import { ObjectId } from 'mongodb';
import { Cart } from './Icart';

export interface User {
    _id: ObjectId;
    productId: ObjectId;
    cart: Cart;
}
