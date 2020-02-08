import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from "./user.entity";

@Controller('users')
export class UserController {

    constructor(private userService: UserService) { }

    @Get()
    findAll() {
        return this.userService.getUsers();
    }
    
    @Get(':id')
    find(@Param('id') id: number) {
        return this.userService.getUser(id);
    }

    @Post()
    create(@Body() user: User) {
        return this.userService.updateUser(user);
    }

}
