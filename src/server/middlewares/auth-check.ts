import express from 'express';

export function authCheck(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) {
    if (!request.session.isAuthenticated) {
        return response.redirect('/auth/sign-in');
    }
    next();
}
