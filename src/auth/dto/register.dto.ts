import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/users/enum/role.enum';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty()
  @Matches(/^[A-Z][a-zA-Z\d\W_]{7,}$/, {
    message:
      'Password must be at least 8 characters long, start with an uppercase letter, and contain at least one number.',
  })
  password: string;

  @IsOptional()
  @ApiProperty()
  role?: UserRole;
}
