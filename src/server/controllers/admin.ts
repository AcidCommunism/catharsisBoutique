import { Product } from '../models/product';
import express from 'express';
import { logger } from '../../logger';

export class AdminController {
    public getAddProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
        });
    };

    public postAddProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const { title, imageUrl, price, description } = req.body;
        const product = new Product(
            title,
            price,
            description,
            imageUrl,
            null,
            req?.user?._id!
        );
        product
            .save()
            .then(result => {
                logger.info('Created product');
                res.redirect('/admin/products');
            })
            .catch(err => logger.error(err));
    };

    public getEditProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const editMode = req.query.edit;
        if (!editMode) {
            return res.redirect('/');
        }
        const prodId = req.params.productId;

        Product.findById(prodId)
            .then(product => {
                if (!product) {
                    return res.redirect('/');
                }
                res.render('admin/edit-product', {
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: editMode,
                    product: product,
                });
            })
            .catch(err => logger.error(err));
    };

    public postEditProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const { productId, title, imageUrl, price, description } = req.body;

        const product = new Product(
            title,
            price,
            description,
            imageUrl,
            productId,
            req?.user?._id!
        );
        return product
            .save()
            .then(() => res.redirect('/admin/products'))
            .catch(err => logger.error(err));
    };

    public getProducts = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        Product.fetchAll()
            .then(products => {
                res.render('admin/products', {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products',
                });
            })
            .catch(err => logger.error(err));
    };

    public postDeleteProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const prodId = req.body.productId;
        Product.findById(prodId)
            //@ts-ignore
            .then(product => Product.deleteById(product!._id))
            .then(result => {
                logger.info(`Deleted product with id: ${prodId}`);
                res.redirect('/admin/products');
            })
            .catch(err => logger.error(err));
    };
}
