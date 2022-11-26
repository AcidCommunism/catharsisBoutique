import express from 'express';
import { logger } from '../../logger';
import { User } from '../models/user';

export function injectUser(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) {
    User.findById(request.session.user?._id)
        .then(user => {
            if (user) {
                request.user = user;
                next();
            } else {
                request.user = null;
                next();
            }
        })
        .catch(err => logger.error(err));
}
