import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../users/user.entity';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserConstants } from '../constants/user.constants';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    private async validate(clave: string): Promise<User> {
        return await this.userService.getUserByClave(clave);
    }

    public async login(clave: string): Promise<any | { status: number }> {
        return this.validate(clave).then((userData) => {
            if (!userData) {
                return { status: 404 }
            }
            let payload = `${userData.id}${userData.clave}${userData.nombre}`;
            const accessToken = this.jwtService.sign(payload);

            return {
                expires_in: 3600,
                access_token: accessToken,
                user_id: userData.id,
                status: 200
            }
        });
    }

}
