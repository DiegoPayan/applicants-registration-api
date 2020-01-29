import { Connection } from 'typeorm';
import { User } from './user.entity';
export declare const userProviders: {
    provide: string;
    useFactory: (connection: Connection) => import("typeorm").Repository<User>;
    inject: string[];
}[];
