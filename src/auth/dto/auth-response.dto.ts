import { User } from 'src/users/entities/user.entity';

export class AuthResponseDto {
  istifadeci: Partial<User>;
  accessToken: string;
  refreshToken: string;
}
