import { User } from './user.entity';
import { Repository } from 'typeorm';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    getUsers(): Promise<User[]>;
    getUser(id: number): Promise<User>;
    updateUser(user: User): Promise<void>;
}
