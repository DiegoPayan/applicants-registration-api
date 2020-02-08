import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) { }

    @Post('login')
    async login(@Body() clave: string): Promise<any> {
      return this.authService.login(clave);
    }

}
