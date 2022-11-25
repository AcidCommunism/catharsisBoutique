import express from 'express';
import { logger } from '../../logger';

export function loggerMiddleware(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
) {
    logger.info(`${request.method} ${request.path}`);
    next();
}
