import { Product } from '../models/product';
import { Order } from '../models/order';
import express from 'express';
import { logger } from '../../logger';
import { User } from '../../types/Iuser';

export class ShopController {
    public getProducts = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        Product.find()
            .then(products => {
                res.render('shop/product-list', {
                    prods: products,
                    pageTitle: 'All Products',
                    path: '/products',
                });
            })
            .catch(err => logger.error(err));
    };

    public getIndex = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        Product.find()
            .then(products => {
                res.render('shop/index', {
                    prods: products,
                    pageTitle: 'Shop',
                    path: '/',
                });
            })
            .catch(err => logger.error(err));
    };

    public getProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const prodId = req.params.productId;
        Product.findById(prodId)
            .then(product => {
                res.render('shop/product-detail', {
                    product: product,
                    //@ts-ignore
                    pageTitle: product!.title,
                    path: '/products',
                });
            })
            .catch(err => logger.error(err));
    };

    public getCart = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        req.user.populate('cart.items.productId').then((user: User) => {
            logger.info('Cart items: ');
            logger.info(user.cart.items);
            return res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your cart',
                products: user.cart.items,
            });
        });
    };

    public postCart = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const prodId = req.body.productId;
        Product.findById(prodId)
            .then(product => req?.user?.addToCart(product))
            .then(result => res.redirect('/cart'))
            .catch(err => logger.error(err));
    };

    public postCartDeleteProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const prodId = req.body.productId;
        req?.user?.removeFromCart(prodId)?.then(() => res.redirect('/cart'));
    };

    public getOrders = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        Order.find({ 'user.userId': req.user._id })
            .then(orders =>
                res.render('shop/orders', {
                    path: '/orders',
                    pageTitle: 'Your orders',
                    orders: orders,
                })
            )
            .catch(err => logger.error(err));
    };

    public postOrder = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        req.user
            .populate('cart.items.productId')
            .then((user: User) => {
                const products = user.cart.items.map(i => {
                    return {
                        quantity: i.quantity,
                        product: { ...i.productId },
                    };
                });
                const order = new Order({
                    user: {
                        name: req.user.name,
                        userId: req.user,
                    },
                    products: products,
                });
                order.save();
            })
            .then(() => req.user.clearCart())
            .then(() => res.redirect('/orders'));
    };
}
