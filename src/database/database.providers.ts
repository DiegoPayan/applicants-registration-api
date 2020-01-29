import {DatabaseConstants} from '../constants/database.constants';
import {createConnection} from 'typeorm';

export const databaseProviders = [
    {
        provide: DatabaseConstants.DATABASE_CONNECTION,
        useFactory: async () => await createConnection({
            type: 'mysql',
            host: process.env.DATABASE_HOST || 'localhost',
            // tslint:disable-next-line:radix
            port: parseInt(process.env.DATABASE_PORT) || 3306,
            username: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSWORD || 'root',
            database: process.env.DATABASE_SCHEMA || 'test',
            entities: [
                __dirname + '/../**/*.entity{.ts,.js}',
            ],
        }),
    },
];
