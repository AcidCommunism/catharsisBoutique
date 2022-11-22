import express from 'express';
import { ShopController } from '../controllers/shop';

export class ShopRouter {
    private router: express.Router;
    private shopController: ShopController;

    constructor() {
        this.router = express.Router();
        this.shopController = new ShopController();
        this.router.get('/', this.shopController.getIndex);
        this.router.get('/products', this.shopController.getProducts);
        this.router.get('/products/:productId', this.shopController.getProduct);
        this.router.get('/cart', this.shopController.getCart);
        this.router.post('/cart', this.shopController.postCart);
        this.router.post(
            '/cart-delete-item',
            this.shopController.postCartDeleteProduct
        );
        this.router.get('/orders', this.shopController.getOrders);
        this.router.post('/create-order', this.shopController.postOrder);
    }

    public get() {
        return this.router;
    }
}
