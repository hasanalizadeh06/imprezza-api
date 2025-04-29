import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names if you are saving locally

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async uploadProfilePhoto(
    user: User,
    file: any,
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log('uploadProfilePhoto --> Start');

      // Assuming you're saving the image locally in a directory called 'uploads'
      const fileName = `${uuidv4()}.jpg`; // Generate a unique name for the file
      const filePath = `./uploads/profile-photos/${fileName}`;

      // Save the file locally (e.g., using fs, multer, etc.)
      const fs = require('fs');
      fs.writeFileSync(filePath, file.buffer); // Save the file buffer locally

      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          avatarUrl: filePath, // Store the file path in the user entity
        },
      );

      if (user.avatarUrl) {
        this.logger.log('uploadProfilePhoto --> Old photo exists');
        const oldPath: string = user.avatarUrl;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Remove old photo from file system
        }
        this.logger.log('uploadProfilePhoto --> Old photo deleted');
      }

      this.logger.log('uploadProfilePhoto --> Success');
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error('Error uploading profile photo', error);
      throw new BadRequestException('Failed to upload profile photo');
    }
  }

  async deleteProfilePhoto(user: User): Promise<{ success: boolean }> {
    try {
      this.logger.log('deleteProfilePhoto --> Start');

      const freshUser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!freshUser || !freshUser.avatarUrl) {
        this.logger.error('deleteProfilePhoto --> Does not exist');
        throw new BadRequestException('Profile photo does not exist');
      }

      const filePath = freshUser.avatarUrl;

      // Delete the file from the local system
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the photo from file system
      }

      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          avatarUrl: null,
        },
      );

      this.logger.log('deleteProfilePhoto --> Success');
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error('Error deleting profile photo', error);
      throw new BadRequestException('Failed to delete profile photo');
    }
  }

  async getProfileMe(userId: string): Promise<any> {
    try {
      this.logger.log('getProfileMe --> Start');

      const user = await this.userRepository.findOne({
        where: { id: userId }, // Expecting string ID here
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'role',
          'avatarUrl',
          'isActive',
          'createdAt',
          'updatedAt',
          'lastLoginDate',
        ],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { password, refreshToken, ...userWithoutSensitiveInfo } = user;

      this.logger.log('getProfileMe --> Success');
      return userWithoutSensitiveInfo;
    } catch (error) {
      this.logger.error(`getProfileMe --> Error: ${error.message}`);
      throw error;
    }
  }
}
