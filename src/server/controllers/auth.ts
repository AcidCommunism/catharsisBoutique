import express from 'express';
import * as bcryptjs from 'bcryptjs';
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
            user: req.session.user,
        });
    }

    public getSignUp(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        res.render('auth/sign-up', {
            path: '/sign-up',
            pageTitle: 'Sign up',
            isAuthenticated: req.session.isAuthenticated,
            user: req.session.user,
        });
    }

    public postSignIn(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const { email, password } = req.body;
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return res.redirect('/sign-up');
                }
                bcryptjs
                    .compare(password, user.password.toString())
                    .then(isMatching => {
                        if (isMatching) {
                            req.session.user = user;
                            req.session.isAuthenticated = true;
                            return req.session.save(() => {
                                res.redirect('/');
                            });
                        }
                        res.redirect('/sign-in');
                    });
            })
            .catch(err => logger.error(err));
    }

    public postSignUp(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const { name, email, password, confirmPassword } = req.body;
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    return res.redirect('/sign-in');
                }
                return bcryptjs.hash(password, 12).then(passwordHash => {
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: passwordHash,
                        cart: { items: [] },
                    });
                    newUser.save(() => res.redirect('/sign-in'));
                });
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
