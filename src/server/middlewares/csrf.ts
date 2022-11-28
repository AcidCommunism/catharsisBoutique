import express from 'express';
import * as csrf from 'csurf';

export function injectCsrfToken(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) {
    response.locals.isAuthenticated = request.session.isAuthenticated;
    response.locals.csrfToken = request.csrfToken();
    next();
}
