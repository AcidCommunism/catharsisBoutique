import { Document, ObjectId } from 'mongoose';

export interface Product extends Document {
    productId: ObjectId;
    _id: ObjectId;
    title: string;
    price: number;
    description: string;
    imageUrl: string;
}
