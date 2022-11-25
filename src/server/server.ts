import path from 'path';
import { logger } from '../logger';
import * as dotenv from 'dotenv';
import express from 'express';
import * as bodyParser from 'body-parser';
import { Db } from 'mongodb';
import mongoose from 'mongoose';
import { AdminRouter } from './routes/admin';
import { ShopRouter } from './routes/shop';
import { ErrorController } from './controllers/error';

import { loggerMiddleware } from './middlewares/request-logger';
import { injectUser } from './middlewares/inject-user';

dotenv.config({
    path: './src/server/.env',
});

class App {
    public app: express.Application;
    public port: number;
    public dbConnection: Db | undefined;

    constructor(
        routers: { name?: string; path?: string; router: express.Router }[],
        port: number
    ) {
        this.app = express();
        this.port = port;
        this._setViewsEngine();
        this._setStylesPaths();
        this._initMiddlewares();
        this._initRouters(routers);
        this._initDefaultControllers();
        this._establishDbConnection();
    }

    private _initMiddlewares() {
        logger.info('Initializing middlewares...');

        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(loggerMiddleware);
        // TODO: will be deleted after auth is implemented
        this.app.use(injectUser);

        logger.info('Middlewares successfully initialized!');
    }

    private _setViewsEngine() {
        logger.info('Setting view engine...');

        this.app.set('view engine', 'pug');
        this.app.set('views', 'views');

        logger.info('View engine is set!');
    }

    private _setStylesPaths() {
        logger.info('Setting styles paths...');

        this.app.use(express.static(path.join(__dirname, '../../../public')));
        this.app.use(
            '/bootstrap',
            express.static(
                path.join(__dirname, '../../../node_modules/bootstrap')
            )
        );
        this.app.use(
            '/admin/bootstrap',
            express.static(
                path.join(__dirname, '../../../node_modules/bootstrap')
            )
        );
        this.app.use(
            '/admin/edit-product/bootstrap',
            express.static(
                path.join(__dirname, '../../../node_modules/bootstrap')
            )
        );
        this.app.use(
            '/products/bootstrap',
            express.static(
                path.join(__dirname, '../../../node_modules/bootstrap')
            )
        );

        logger.info('Styles paths are set!');
    }

    private _initRouters(
        routers: { name?: string; path?: string; router: express.Router }[]
    ) {
        logger.info('Initializing server application routers...');

        routers.forEach(router => {
            logger.info(`Initializing router ${router.name}`);
            router.path
                ? this.app.use(router.path, router.router)
                : this.app.use(router.router);
            logger.info(`Router ${router.name} successfully initialized!`);
        });

        logger.info('All routers initialized!');
    }

    private _initDefaultControllers() {
        logger.info('Initializing default controllers...');

        this.app.use(new ErrorController().get404);

        logger.info('Default controllers initialized!');
    }

    private async _establishDbConnection() {
        try {
            logger.info('Establishing DB connection...');
            await mongoose.connect(
                `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`
            );
            logger.info('DB connection established!');
        } catch (error) {
            logger.error(
                'Something went wrong when establishing db connection'
            );
            logger.error(error);
            process.exit(1);
        }
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`App started, listening port ${this.port}`);
        });
    }
}

const server = new App(
    [
        // list of routers
        {
            name: 'Admin router',
            path: '/admin',
            router: new AdminRouter().get(),
        },
        {
            name: 'Shop router',
            router: new ShopRouter().get(),
        },
    ],
    process.env.SERVER_LISTENING_PORT
);
server.listen();
