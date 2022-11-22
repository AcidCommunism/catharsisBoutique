import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import { logger } from '../../logger';

export class DataBase {
    private _dbUser: string;
    private _dbHost: string;
    private _dbPwd: string;
    private _dbName: string;
    private _connectionOptions: object;
    private _connectionString: string;
    private _client: MongoClient;
    private static _db_connection: Db | undefined;

    constructor(
        dbUser: string = process.env.DB_USER,
        dbPwd: string = process.env.DB_PWD,
        dbHost: string = process.env.DB_HOST,
        dbName: string = process.env.DB_NAME,
        options: object = {
            serverApi: ServerApiVersion.v1,
        }
    ) {
        this._dbUser = encodeURIComponent(dbUser);
        this._dbHost = dbHost;
        this._dbPwd = encodeURIComponent(dbPwd);
        this._dbName = dbName;
        this._connectionOptions = options;
        this._connectionString = `mongodb+srv://${this._dbUser}:${this._dbPwd}@${this._dbHost}/?retryWrites=true&w=majority`;
        this._client = new MongoClient(
            this._connectionString,
            this._connectionOptions
        );
    }

    public async connect() {
        try {
            await this._client.connect();
            DataBase._db_connection = this._client.db(this._dbName);
            return DataBase._db_connection;
        } catch (error) {
            logger.error('Mongo connection error occured!😒');
            logger.error(error);
            throw error;
        }
    }

    public static getDbConnection() {
        if (DataBase._db_connection) {
            return DataBase._db_connection;
        }
        throw 'DB not found!';
    }
}
