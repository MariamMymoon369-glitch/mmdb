import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, SafeUser } from './auth.service'; // استوردنا SafeUser
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<SafeUser> {
    return await this.authService.signup(signupDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ user: SafeUser; accessToken: string }> {
    return await this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(): { message: string } {
    return { message: 'Logged out successfully' };
  }
}
