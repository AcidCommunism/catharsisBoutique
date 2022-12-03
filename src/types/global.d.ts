import { User } from '../server/models/user';

export {};
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            APP_URL: string;
            SERVER_LISTENING_PORT: number;
            DB_HOST: string;
            DB_NAME: string;
            DB_USER: string;
            DB_PWD: string;
            DB_SESSION_COLLECTION: string;
            EMAIL_SERVER_HOST: string;
            EMAIL_SERVER_PORT: number;
            EMAIL_SERVER_API_KEY: string;
            MAIL_FROM_ADDRESS: string;
            SHOP_NAME: string;
        }
    }

    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        isAuthenticated?: Boolean;
        user: User;
    }
}
