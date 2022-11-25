import express from 'express';
import { logger } from '../../logger';
import { User } from '../models/user';

export function injectUser(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) {
    User.findOne()
        .then(user => {
            if (!user) {
                const user = new User({
                    name: 'Max',
                    email: 'max.zamota@gmail.com',
                    cart: {
                        items: [],
                    },
                });
                user.save();
                request.user = user;
                next();
            } else {
                request.user = user;
                next();
            }
        })
        .catch(err => logger.error(err));
}
