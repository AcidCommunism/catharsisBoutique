import { Product } from '../models/product';
import express from 'express';
import { logger } from '../../logger';

export class ShopController {
    public getProducts = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        Product.fetchAll()
            .then(products => {
                res.render('shop/product-list', {
                    prods: products,
                    pageTitle: 'All Products',
                    path: '/products',
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

    public getIndex = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        Product.fetchAll()
            .then(products => {
                res.render('shop/index', {
                    prods: products,
                    pageTitle: 'Shop',
                    path: '/',
                });
            })
            .catch(err => logger.error(err));
    };

    public getCart = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        req?.user
            ?.getCart()
            .then(products => {
                logger.info('Products:', products);
                return res.render('shop/cart', {
                    path: '/cart',
                    pageTitle: 'Your cart',
                    products: products,
                });
            })
            .catch(err => logger.error(err));
    };

    public postCart = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const prodId = req.body.productId;
        Product.findById(prodId)
            //@ts-ignore
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
        req?.user
            ?.deleteItemFromCart(prodId)
            ?.then(() => res.redirect('/cart'))
            .catch(err => logger.error(err));
    };

    public getOrders = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        req?.user
            ?.getOrders()
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
        console.log(req.user);
        req?.user
            ?.addOrder()
            .then(() => res.redirect('/orders'))
            .catch(err => logger.error(err));
    };
}
