import { ObjectId } from 'mongodb';
import { Cart } from './Icart';

export interface User {
    _id: ObjectId;
    name: String;
    email: String;
    password: String;
    cart: Cart;
}
