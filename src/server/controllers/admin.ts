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
            isAuthenticated: req.session.isAuthenticated,
            user: req.session.user,
        });
    };

    public postAddProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const { title, imageUrl, price, description } = req.body;
        const product = new Product({
            title: title,
            imageUrl: imageUrl,
            price: price,
            description: description,
            userId: req.user,
            isAuthenticated: req.session.isAuthenticated,
            user: req.session.user,
        });
        product
            .save()
            .then(() => {
                logger.info('Created product');
                res.redirect('/admin/products');
            })
            .catch(err => logger.error(err));
    };

    public getProducts = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        Product.find()
            .select('_id title imageUrl price')
            // .populate('userId', 'name')
            .then(products => {
                res.render('admin/products', {
                    prods: products,
                    pageTitle: 'Admin Products',
                    path: '/admin/products',
                    isAuthenticated: req.session.isAuthenticated,
                    user: req.session.user,
                });
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
                    isAuthenticated: req.session.isAuthenticated,
                    user: req.session.user,
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

        Product.findById(productId)
            .then(product => {
                product!.title = title;
                product!.imageUrl = imageUrl;
                product!.price = price;
                product!.description = description;
                return product?.save();
            })
            .then(() => res.redirect('/admin/products'))
            .catch(err => logger.error(err));
    };

    public postDeleteProduct = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const prodId = req.body.productId;
        Product.findByIdAndRemove(prodId)
            .then(result => {
                logger.info(`Deleted product with id: ${prodId}`);
                res.redirect('/admin/products');
            })
            .catch(err => logger.error(err));
    };
}
