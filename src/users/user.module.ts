import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {DatabaseModule} from '../database/database.module';
import {userProviders} from './user.providers';

@Module({
    imports: [DatabaseModule],
    providers: [
        ...userProviders,
        UserService,
    ],
    controllers: [UserController],
})
export class UserModule {}
