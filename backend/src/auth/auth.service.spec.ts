import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should throw ConflictException if email already exists during signup', async () => {
    jest
      .spyOn(usersService, 'findByEmail')
      .mockResolvedValue({ id: 1 } as User);

    await expect(
      service.signup({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        displayName: 'TestUser',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should successfully login a user with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      passwordHash: hashedPassword,
      uuid: 'some-uuid',
    };

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as User);

    const result = await service.login({
      email: 'test@example.com',
      password: 'password123',
      keepMeSignedIn: false,
    });

    expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
    expect(result.user).toHaveProperty('email', mockUser.email);
  });

  it('should throw UnauthorizedException if password does not match', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const mockUser = {
      email: 'test@example.com',
      passwordHash: hashedPassword,
    };

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as User);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'wrongpassword',
        keepMeSignedIn: false,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
