import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthConstants } from '../constants/auth.constants';
import { AuthController } from './auth.controller';
import { userProviders } from '../users/user.providers';

@Module({
    imports: [TypeOrmModule.forFeature([User]),
    JwtModule.register({
        secretOrPrivateKey: AuthConstants.SECRET_PASS
    })
    ],
    providers: [
        ...userProviders,
        AuthService
    ],
    controllers: [AuthController]
})

export class AuthModule { }