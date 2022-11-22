import mongodb from 'mongodb';

export interface Product {
    productId: mongodb.ObjectId;
    _id: mongodb.ObjectId;
}
