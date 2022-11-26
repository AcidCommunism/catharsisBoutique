import express from 'express';
import { AdminController } from '../controllers/admin';
import { authCheck } from '../middlewares/auth-check';

export class AdminRouter {
    private router: express.Router;
    private adminController: AdminController;

    constructor() {
        this.router = express.Router();
        this.adminController = new AdminController();
        this.router.get(
            '/add-product',
            authCheck,
            this.adminController.getAddProduct
        );
        this.router.get(
            '/products',
            authCheck,
            this.adminController.getProducts
        );
        this.router.post(
            '/add-product',
            authCheck,
            this.adminController.postAddProduct
        );
        this.router.get(
            '/edit-product/:productId',
            authCheck,
            this.adminController.getEditProduct
        );
        this.router.post(
            '/edit-product',
            authCheck,
            this.adminController.postEditProduct
        );
        this.router.post(
            '/delete-product',
            authCheck,
            this.adminController.postDeleteProduct
        );
    }

    public get() {
        return this.router;
    }
}
