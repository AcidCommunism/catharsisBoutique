import express from 'express';
import { logger } from '../../logger';
import { User } from '../models/user';

export class AuthController {
    public getSignIn(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        res.render('auth/sign-in', {
            path: '/sign-in',
            pageTitle: 'Sign in',
            isAuthenticated: req.session.isAuthenticated,
        });
    }

    public postSignIn(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        User.findOne()
            .then(user => {
                if (!user) {
                    user = new User({
                        name: 'Max',
                        email: 'max.zamota@gmail.com',
                        cart: {
                            items: [],
                        },
                    });
                    user.save();
                }
                req.session.user = user;
                req.session.isAuthenticated = true;
                res.redirect('/');
            })
            .catch(err => logger.error(err));
    }

    public postSignOut(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.session.destroy(err => {
            if (err) {
                logger.error(err);
            }
            res.redirect('/');
        });
    }
}
