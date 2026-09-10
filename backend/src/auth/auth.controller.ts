import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { SafeUser } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: ExpressRequest & { user: SafeUser }): SafeUser {
    return req.user;
  }
}
