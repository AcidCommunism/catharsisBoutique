import express from 'express';

export function flashMessagesMiddleware(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) {
    // TODO: flash messages are really buggy/flacky. Need to fix l8r
    response.locals.successMessages = request.flash('success');
    response.locals.errorMessages = request
        .flash('error')
        .filter(msg => msg !== null || msg !== '');
    next();
}
