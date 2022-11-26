import express from 'express';
import { ShopController } from '../controllers/shop';
import { authCheck } from '../middlewares/auth-check';

export class ShopRouter {
    private router: express.Router;
    private shopController: ShopController;

    constructor() {
        this.router = express.Router();
        this.shopController = new ShopController();
        this.router.get('/', this.shopController.getIndex);
        this.router.get('/products', this.shopController.getProducts);
        this.router.get('/products/:productId', this.shopController.getProduct);
        this.router.get('/cart', authCheck, this.shopController.getCart);
        this.router.post('/cart', authCheck, this.shopController.postCart);
        this.router.post(
            '/cart-delete-item',
            authCheck,
            this.shopController.postCartDeleteProduct
        );
        this.router.get('/orders', authCheck, this.shopController.getOrders);
        this.router.post(
            '/create-order',
            authCheck,
            this.shopController.postOrder
        );
    }

    public get() {
        return this.router;
    }
}
