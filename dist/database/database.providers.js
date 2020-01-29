"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_constants_1 = require("../constants/database.constants");
const typeorm_1 = require("typeorm");
exports.databaseProviders = [
    {
        provide: database_constants_1.DatabaseConstants.DATABASE_CONNECTION,
        useFactory: async () => await typeorm_1.createConnection({
            type: 'mysql',
            host: process.env.DATABASE_HOST || 'localhost',
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
//# sourceMappingURL=database.providers.js.map