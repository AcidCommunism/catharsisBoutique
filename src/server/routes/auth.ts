import express from 'express';
import { AuthController } from '../controllers/auth';

export class AuthRouter {
    private router: express.Router;
    private authController: AuthController;
    constructor() {
        this.router = express.Router();
        this.authController = new AuthController();
        this.router.get('/sign-in', this.authController.getSignIn);
        this.router.get('/sign-up', this.authController.getSignUp);
        this.router.post('/sign-in', this.authController.postSignIn);
        this.router.post('/sign-out', this.authController.postSignOut);
    }

    public get() {
        return this.router;
    }
}
