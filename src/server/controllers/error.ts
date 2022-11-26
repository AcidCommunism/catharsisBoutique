import express from 'express';

export class ErrorController {
    public get404 = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        res.status(404).render('404', {
            pageTitle: 'Page Not Found',
            path: '/404',
            isAuthenticated: req.session.isAuthenticated,
            user: req.session.user,
        });
    };
}
