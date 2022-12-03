import { Document, ObjectId } from 'mongoose';
import { Cart } from './Icart';

export interface User extends Document {
    _id: ObjectId;
    name: String;
    email: String;
    password: String;
    cart: Cart;
    resetToken?: String | null;
    resetTokenExpiration?: Date | null;
}
