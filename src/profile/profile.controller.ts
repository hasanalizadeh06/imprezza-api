import {
  Controller,
  Post,
  Delete,
  Get,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ProfileService } from './profile.service';
import { Express } from 'express'; // Import Express for file type

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Post('photo')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePhoto(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File, // Fix type here
  ): Promise<{ success: boolean }> {
    return this.profileService.uploadProfilePhoto(user, file);
  }

  @Delete('photo')
  deleteProfilePhoto(@GetUser() user: User): Promise<{ success: boolean }> {
    return this.profileService.deleteProfilePhoto(user);
  }

  @Get('me')
  async getProfile(@Req() req) {
    const user = req.user;
    return await this.profileService.getProfileMe(user.id);
  }
}
