import { UserService } from './user.service';
import { User } from "./user.entity";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    find(id: number): Promise<User>;
    findAll(): Promise<User[]>;
    create(user: User): Promise<void>;
}
