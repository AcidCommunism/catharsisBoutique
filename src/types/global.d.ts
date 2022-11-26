import { User } from '../server/models/user';

export {};
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SERVER_LISTENING_PORT: number;
            DB_HOST: string;
            DB_NAME: string;
            DB_USER: string;
            DB_PWD: string;
            DB_SESSION_COLLECTION: string;
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
