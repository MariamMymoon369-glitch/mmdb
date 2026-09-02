import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<SafeUser> {
    const { email, password, firstName, lastName } = signupDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await this.usersService.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    return this.getSafeUser(newUser);
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: SafeUser; accessToken: string }> {
    const { email, password, keepMeSignedIn } = loginDto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, uuid: user.uuid };
    const expiresIn = keepMeSignedIn ? '30d' : '1d';

    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      user: this.getSafeUser(user),
      accessToken,
    };
  }

  private getSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
    };
  }
}
