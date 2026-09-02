import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  displayName: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @IsNotEmpty()
  password: string;
}
