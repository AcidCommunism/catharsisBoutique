import path from 'path';
import { logger } from '../logger';
import * as dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import * as bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { AdminRouter } from './routes/admin';
import { ShopRouter } from './routes/shop';
import { AuthRouter } from './routes/auth';
import { ErrorController } from './controllers/error';

import { loggerMiddleware } from './middlewares/request-logger';
import { injectUser } from './middlewares/inject-user';

dotenv.config({
    path: './src/server/.env',
});

class App {
    private app: express.Application;
    private port: number;
    private mongoConnectionString: string;
    private sessionStorage: ConnectMongoDBSession.MongoDBStore;

    constructor(
        routers: { name?: string; path?: string; router: express.Router }[],
        port: number
    ) {
        this.app = express();
        this.port = port;
        this.mongoConnectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
        const MongoDbStore = ConnectMongoDBSession(session);
        this.sessionStorage = new MongoDbStore({
            uri: this.mongoConnectionString,
            collection: process.env.DB_SESSION_COLLECTION,
        });
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
        this.app.use(
            session({
                secret: 'my secret',
                resave: false,
                saveUninitialized: false,
                store: this.sessionStorage,
            })
        );

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
                this.mongoConnectionString + '?retryWrites=true&w=majority'
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
        {
            name: 'Auth router',
            router: new AuthRouter().get(),
        },
    ],
    process.env.SERVER_LISTENING_PORT
);
server.listen();
