import express from 'express';
import * as bcryptjs from 'bcryptjs';
import { logger } from '../../logger';
import { User } from '../models/user';
import { Mailer } from '../util/mailer';
import crypto from 'crypto';
import { User as IUser } from '../../types/Iuser';
import { validationResult } from 'express-validator/check';

export class AuthController {
    public getSignIn(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        res.render('auth/sign-in', {
            path: '/auth/sign-in',
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
            path: '/auth/sign-up',
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
                    res.locals.errorMessages = req.flash('error');
                    return res.status(422).render('auth/sign-in', {
                        path: '/auth/sign-in',
                        pageTitle: 'Sign in',
                        user: req.session.user,
                        previousInput: {
                            email: email,
                            password: password,
                        },
                    });
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
                                '<p>Try again?</p><p>Or perhaps you need a <a href="/auth/reset-pwd">password reset</a>?</p>'
                        );
                        res.locals.errorMessages = req.flash('error');
                        res.status(422).render('auth/sign-in', {
                            path: '/auth/sign-in',
                            pageTitle: 'Sign in',
                            user: req.session.user,
                            previousInput: {
                                email: email,
                                password: password,
                            },
                        });
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
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            logger.info(validationErrors);
            validationErrors
                .array()
                .forEach(err =>
                    req.flash(
                        'error',
                        `Error in field "${err.param}"!<p>${err.msg}</p>`
                    )
                );
            res.locals.errorMessages = req.flash('error');
            return res.status(422).render('auth/sign-up', {
                path: '/auth/sign-up',
                pageTitle: 'Sign up',
                user: req.session.user,
                previousInput: {
                    name: name,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                },
            });
        }

        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    req.flash(
                        'error',
                        'Hmm!🤔 Looks like user with such email already exists...\n' +
                            '<p>If you are a user already, you can <a href="/auth/sign-in">sign in</a>.</p>' +
                            '<p>Or perhaps you need a <a href="/auth/reset-pwd">password reset</a>?</p>'
                    );
                    res.locals.errorMessages = req.flash('error');
                    return res.redirect('/auth/sign-up');
                }
                return bcryptjs
                    .hash(password, 12)
                    .then(passwordHash => {
                        const newUser = new User({
                            name: name,
                            email: email,
                            password: passwordHash,
                            cart: { items: [] },
                        });
                        newUser.save();
                    })
                    .then(() => {
                        return Mailer.sendMail(
                            email,
                            `Sup ${name}? ${process.env.SHOP_NAME} shop welcomes you!`,
                            '<h1>Hi!</h1><p>Here goes our welcoming letter, blah-blah...</p>'
                        );
                    })
                    .then(result => {
                        logger.info(
                            `Outbound e-mail for user ${email} sent. Result:`
                        );
                        logger.info(result);
                    })
                    .then(() => res.redirect('/auth/sign-in'));
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

    public getResetPassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        res.render('auth/password-reset', {
            path: '/auth/reset-pwd',
            pageTitle: 'Reset password',
            user: req.session.user,
        });
    }

    public postResetPassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                logger.error(err);
                return res.redirect('/auth/reset-pwd');
            }
            const token = buffer.toString('hex');
            User.findOne({ email: req.body.email })
                .then(user => {
                    if (!user) {
                        req.flash('error', 'No account found 🤔');
                        return res.redirect('/auth/reset-pwd');
                    }
                    user.resetToken = token;
                    user.resetTokenExpiration = new Date(
                        Date.now() + 360 * 1000
                    );
                    user.save()
                        .then(user => {
                            return Mailer.sendMail(
                                user!.email.toString(),
                                `${process.env.SHOP_NAME} shop here👋About that password reset...`,
                                `
                                <h1>Sup ${user?.name}!</h1><p>We just got a password reset request from somebody.</p>
                                <p>If that was you, then here is your <a target="_blank" href="${process.env.APP_URL}/auth/update-pwd/${token}">link</a>.</p>
                                <p>Otherwise - please ignore this letter.</p>
                                <p>Have a nice one😉</p>
                                `
                            );
                        })
                        .then(result => {
                            logger.info(
                                `Outbound e-mail for user ${
                                    user!.email
                                } sent. Result:`
                            );
                            logger.info(result);
                            req.flash(
                                'success',
                                `Letter with password reset link sent to ${req.body.email}`
                            );
                            res.redirect('/auth/sign-in');
                        });
                })
                .catch(err => logger.error(err));
        });
    }

    public getUpdatePassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const token = req.params.token;
        User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: new Date(Date.now()) },
        })
            .then(user => {
                res.render('auth/update-password', {
                    path: '/auth/update-pwd',
                    pageTitle: 'Update password',
                    user: req.session.user,
                    userId: user!._id.toString(),
                    passwordToken: token,
                });
            })
            .catch(err => logger.error(err));
    }

    public postNewPassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const { password, userId, passwordToken } = req.body;
        let updatedUser: IUser;

        User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: new Date(Date.now()) },
            _id: userId,
        })
            .then(user => {
                if (user) {
                    updatedUser = user;
                    return bcryptjs.hash(password, 12);
                }
                req.flash('error', 'User not found😐');
                res.redirect('/auth/sign-in');
            })
            .then(hashedPassword => {
                updatedUser.password = hashedPassword!;
                updatedUser.resetToken = null;
                updatedUser.resetTokenExpiration = null;
                updatedUser.save();
            })
            .then(() =>
                Mailer.sendMail(
                    updatedUser!.email.toString(),
                    `${process.env.SHOP_NAME} shop - your password successfully updated!`,
                    `
                    <h1>Sup ${updatedUser?.name}!</h1><p>We just wanted to tell you, that your password has been successfully updated.</p>
                    <p>All the best,\n<em>${process.env.SHOP_NAME} team.</em></p>
                    `
                )
            )
            .then(result => {
                logger.info(
                    `Outbound e-mail for user ${updatedUser.email} sent. Result:`
                );
                logger.info(result);
                req.flash(
                    'success',
                    'Your password has been updated! <p>You can sign in using it now🙂</p>' +
                        '<p>Happy shopping!</p>'
                );
                res.redirect('/auth/sign-in');
            })
            .catch(err => logger.error(err));
    }
}
