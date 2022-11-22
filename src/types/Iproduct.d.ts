import { ObjectId } from 'mongodb';

export interface Product {
    productId: ObjectId;
    _id: ObjectId;
    title: string;
    price: number;
    description: string;
    imageUrl: string;
}
