import {UserConstants} from '../constants/user.constants';
import {Connection} from 'typeorm';
import {User} from './user.entity';
import {DatabaseConstants} from '../constants/database.constants';

export const userProviders = [
    {
        provide: UserConstants.USER_REPOSITORY,
        useFactory: (connection: Connection) => connection.getRepository(User),
        inject: [DatabaseConstants.DATABASE_CONNECTION],
    },
];
