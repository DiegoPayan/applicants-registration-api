import { Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserConstants } from '../constants/user.constants';

@Injectable()
export class UserService {

    constructor(
        @Inject(UserConstants.USER_REPOSITORY)
        private userRepository: Repository<User>
    ) {}

    async getUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async getUser(id: number): Promise<User> {
        return await this.userRepository.findOne(id);
    }

    async getUserByClave(clave: string) {
        return await this.userRepository.findOne({
            where: {
                clave: clave
            }
        });
    }

    async updateUser(user: User) {
        await this.userRepository.save(user);
    }
}
