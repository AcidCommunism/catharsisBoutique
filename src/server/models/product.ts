import { ObjectId } from 'mongodb';
import { DataBase } from '../util/database';

export class Product {
    private title: string;
    private price: number;
    private description: string;
    private imageUrl: string;
    private _id: ObjectId | null;
    private userId: string;

    constructor(
        title: string,
        price: number,
        description: string,
        imageUrl: string,
        _id: string | null,
        userId: string
    ) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = _id ? new ObjectId(_id) : null;
        this.userId = userId;
    }

    save() {
        const db = DataBase.getDbConnection();
        if (this._id) {
            return db
                .collection('products')
                .updateOne(
                    { _id: this._id },
                    {
                        $set: this,
                    }
                )
                .catch(err => console.log(err));
        }
        return (
            db
                .collection('products')
                //@ts-ignore
                .insertOne(this)
                .catch(err => console.log(err))
        );
    }

    static deleteById(prodId: ObjectId) {
        const db = DataBase.getDbConnection();
        return db
            .collection('products')
            .deleteOne({ _id: new ObjectId(prodId) })
            .then(result => console.log(`Deleted product with id: ${prodId}`))
            .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = DataBase.getDbConnection();
        return db
            .collection('products')
            .find()
            .toArray()
            .then(products => {
                return products;
            })
            .catch(err => console.log(err));
    }

    static findById(prodId: string) {
        const db = DataBase.getDbConnection();
        return db
            .collection('products')
            .find({ _id: new ObjectId(prodId) })
            .next()
            .then(product => {
                return product;
            })
            .catch(err => console.log(err));
    }
}
