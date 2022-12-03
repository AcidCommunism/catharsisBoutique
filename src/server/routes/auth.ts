import express from 'express';
import { AuthController } from '../controllers/auth';
import { check, validationResult } from 'express-validator/check';

export class AuthRouter {
    private router: express.Router;
    private authController: AuthController;
    constructor() {
        this.router = express.Router();
        this.authController = new AuthController();
        this.router.get('/sign-in', this.authController.getSignIn);
        this.router.get('/sign-up', this.authController.getSignUp);
        this.router.post('/sign-in', this.authController.postSignIn);
        this.router.post(
            '/sign-up',
            check('email').isEmail(),
            this.authController.postSignUp
        );
        this.router.post('/sign-out', this.authController.postSignOut);
        this.router.get('/reset-pwd', this.authController.getResetPassword);
        this.router.post('/reset-pwd', this.authController.postResetPassword);
        this.router.get(
            '/update-pwd/:token',
            this.authController.getUpdatePassword
        );
        this.router.post('/update-pwd', this.authController.postNewPassword);
    }

    public get() {
        return this.router;
    }
}
