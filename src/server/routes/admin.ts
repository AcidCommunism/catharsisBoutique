import express from 'express';
import { AdminController } from '../controllers/admin';

export class AdminRouter {
    private router: express.Router;
    private adminController: AdminController;

    constructor() {
        this.router = express.Router();
        this.adminController = new AdminController();
        this.router.get('/add-product', this.adminController.getAddProduct);
        this.router.get('/products', this.adminController.getProducts);
        this.router.post('/add-product', this.adminController.postAddProduct);
        this.router.get(
            '/edit-product/:productId',
            this.adminController.getEditProduct
        );
        this.router.post('/edit-product', this.adminController.postEditProduct);
        this.router.post(
            '/delete-product',
            this.adminController.postDeleteProduct
        );
    }

    public get() {
        return this.router;
    }
}
