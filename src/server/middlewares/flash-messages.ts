import express from 'express';

export function flashMessagesMiddleware(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) {
    response.locals.successMessages = request.flash('success');
    response.locals.errorMessages = request
        .flash('error')
        .filter(msg => msg !== null || msg !== '');
    next();
}
