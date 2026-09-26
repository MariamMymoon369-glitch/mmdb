import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RevokedToken } from './revoked-token.entity';
export type SafeUser = Omit<User, 'passwordHash' | 'hashPassword'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RevokedToken)
    private readonly revokedTokens: Repository<RevokedToken>,
  ) {}

  async signup(signupDto: SignupDto): Promise<SafeUser> {
    const { email, password, firstName, lastName, displayName } = signupDto;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Stored via UsersService.create -> User.@BeforeInsert hashes it once.
    const newUser = await this.usersService.create({
      email: normalizedEmail,
      passwordHash: password,
      firstName,
      lastName,
      displayName,
    });

    return this.getSafeUser(newUser);
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: SafeUser; accessToken: string }> {
    const { email, password, keepMeSignedIn } = loginDto;

    const user = await this.usersService.findByEmail(
      email.toLowerCase().trim(),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      uuid: user.uuid,
      jti: randomUUID(),
    };
    const expiresIn = keepMeSignedIn ? '30d' : '1d';

    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      user: this.getSafeUser(user),
      accessToken,
    };
  }

  async logout(
    userId: number,
    jti: string | undefined,
    rawToken: string | undefined,
  ): Promise<void> {
    // Tokens issued before jti rollout have nothing to revoke.
    if (!jti) {
      return;
    }
    const existing = await this.revokedTokens.findOne({ where: { jti } });
    if (existing) {
      return;
    }
    await this.revokedTokens.save(
      this.revokedTokens.create({
        jti,
        userId,
        expiresAt: this.getTokenExpiry(rawToken),
      }),
    );
  }

  async isRevoked(jti: string | undefined): Promise<boolean> {
    if (!jti) {
      return false;
    }
    const found = await this.revokedTokens.findOne({ where: { jti } });
    return !!found;
  }

  private getTokenExpiry(rawToken: string | undefined): Date {
    try {
      const decoded: unknown = rawToken
        ? this.jwtService.decode(rawToken)
        : null;
      if (
        decoded &&
        typeof decoded === 'object' &&
        typeof (decoded as { exp?: unknown }).exp === 'number'
      ) {
        return new Date((decoded as { exp: number }).exp * 1000);
      }
    } catch {
      // Fall through to the default below.
    }
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  private getSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      displayName: user.displayName,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      reviews: user.reviews,
    };
  }
}
