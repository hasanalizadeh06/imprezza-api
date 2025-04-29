import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../utils/token.service';
import { ProfileService } from '../profile/profile.service';
import { AuthResponse, AuthResponseDto, LoginDto, RegisterDto } from './dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tokenService: TokenService,
    private profileService: ProfileService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || undefined,
      lastLoginDate: new Date(),
    });

    await this.userRepository.save(user);

    const tokens = await this.tokenService.createTokens(
      user.id,
      user.email,
      user.role,
    );
    await this.tokenService.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...userWithoutPassword } = user;
    return {
      istifadeci: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'role',
        'avatarUrl',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const isPasswordCorrect = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginDate = new Date();
    await this.userRepository.save(user);

    const tokens = await this.tokenService.createTokens(
      user.id,
      user.email,
      user.role,
    );

    await this.tokenService.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...userWithoutPassword } = user;
    return {
      istifadeci: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, {
      refreshToken: undefined,
    });

    return { message: 'Successfully logged out' };
  }

  async uploadProfilePhoto(
    user: User,
    file: any,
  ): Promise<{ success: boolean }> {
    return this.profileService.uploadProfilePhoto(user, file);
  }

  async deleteProfilePhoto(user: User): Promise<{ success: boolean }> {
    return this.profileService.deleteProfilePhoto(user);
  }

  async getProfileMe(userId: number): Promise<any> {
    return this.profileService.getProfileMe(userId.toString()); // Convert number to string before passing
  }

  googleLogin(req): AuthResponse {
    if (!req.user) {
      throw new Error('Login failed');
    }

    const { tokens, ...userData } = req.user;

    return {
      statusCode: 200,
      message: 'User data from Google',
      data: {
        user: userData,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
    };
  }
}
