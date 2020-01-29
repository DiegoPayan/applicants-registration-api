import { Connection } from 'typeorm';
export declare class DatabaseModule {
    private readonly connection;
    constructor(connection: Connection);
}
