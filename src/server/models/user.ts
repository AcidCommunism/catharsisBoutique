import mongodb from 'mongodb';
import { DataBase } from '../util/database';
import { Cart } from '../../types/Icart';
import { logger } from '../../logger';
import { Product } from '../../types/Iproduct';

export class User {
    public name: string;
    public email: string;
    public cart: Cart;
    public _id: string;

    constructor(username: string, email: string, cart: Cart, id: string) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = DataBase.getDbConnection();
        return (
            db
                .collection('users')
                //@ts-ignore
                .insertOne(this)
                .catch(err => logger.error(err))
        );
    }

    getCart() {
        const db = DataBase.getDbConnection();
        const productIds = this.cart.items.map(item => item.productId);
        let extendedCart: Product[] = [];
        return db
            .collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                //@ts-ignore
                extendedCart = [...products];
                // We need to cleanup user cart in Mongo DB
                // deleting those products that were not found
                // in 'products' collection
                const foundIds = products.map(product =>
                    product._id.toString()
                );
                this.cart.items = this.cart.items.filter(item =>
                    foundIds.includes(item.productId!.toString())
                );

                logger.info('This cart items', this.cart.items);

                return this._updateCart().then(() => {
                    return extendedCart.map(p => {
                        return {
                            ...p,
                            //@ts-ignore
                            quantity: this.cart.items.find(
                                item =>
                                    item.productId!.toString() ===
                                    p._id.toString()
                            ).quantity,
                        };
                    });
                });
            });
    }

    deleteItemFromCart(productId: number | mongodb.ObjectId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId!.toString() !== productId.toString();
        });
        if (updatedCartItems === this.cart.items) {
            return;
        }
        const updatedCart = { items: updatedCartItems };
        const db = DataBase.getDbConnection();
        return db
            .collection('users')
            .updateOne(
                { _id: new mongodb.ObjectId(this._id) },
                { $set: { cart: updatedCart } }
            );
    }

    _updateCart() {
        const db = DataBase.getDbConnection();
        return db
            .collection('users')
            .updateOne(
                { _id: new mongodb.ObjectId(this._id) },
                { $set: { cart: this.cart } }
            );
    }

    addToCart(product: Product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId!.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: newQuantity,
            });
        }
        this.cart = {
            items: updatedCartItems,
        };
        return this._updateCart();
    }

    addOrder() {
        if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
            throw 'No items in cart!';
        }
        const db = DataBase.getDbConnection();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name,
                        email: this.email,
                    },
                };
                return db.collection('orders').insertOne(order);
            })
            .then(result => {
                this.cart = { items: [] };
                return this._updateCart();
            });
    }

    getOrders() {
        const db = DataBase.getDbConnection();
        return db
            .collection('orders')
            .find({ 'user._id': new mongodb.ObjectId(this._id) })
            .toArray();
    }

    static findById(userId: string) {
        const db = DataBase.getDbConnection();
        return db
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) })
            .catch(err => logger.error(err));
    }
}
