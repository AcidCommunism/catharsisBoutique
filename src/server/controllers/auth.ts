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
                    req.flash('error', 'User not found🙊');
                    return res.redirect('/sign-in');
                }
                bcryptjs
                    .compare(password, user.password.toString())
                    .then(isMatching => {
                        if (isMatching) {
                            req.session.user = user;
                            req.session.isAuthenticated = true;
                            return req.session.save(() => {
                                req.flash(
                                    'success',
                                    `Hello, ${user.name}!\n<p>It is nice to see you!🙃</p>`
                                );
                                res.redirect('/');
                            });
                        }
                        req.flash(
                            'error',
                            "Oh-oh! Username/password don't match🙊\n" +
                                '<p>Try again?</p>'
                        );
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
                    req.flash(
                        'error',
                        'Hmm!🤔 Looks like user with such email already exists...\n' +
                            '<p>If you are a user already, you can <a href="/sign-in">sign in</a>.</p>' +
                            '<p>Or perhaps we can <a href="#">remind you your password</a> if you want?</p>'
                    );
                    return res.redirect('/sign-up');
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
            .catch(err => {
                logger.error(err);
                req.flash(
                    'Something went unexpectedly wrong. Details:\n' +
                        `<p>${err}</p>`
                );
            });
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
