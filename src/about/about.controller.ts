import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { S3Service } from 'src/s3/s3.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/role.enum';

@Controller('about')
@ApiBearerAuth()
export class AboutController {
  constructor(
    private readonly aboutService: AboutService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {}))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        mission: { type: 'string' },
        service: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  async create(
    @Body() createDto: CreateAboutDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.s3Service.uploadFile(image, 'about');
    }

    return this.aboutService.create({
      ...createDto,
      image: imageUrl,
    });
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    if (!page || !limit) {
      throw new BadRequestException('Page and limit parameters are required');
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new BadRequestException('Page must be a positive number');
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      throw new BadRequestException('Limit must be a positive number');
    }

    return this.aboutService.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.aboutService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {}))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        mission: { type: 'string' },
        service: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAboutDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.s3Service.uploadFile(image, 'about');
    }

    return this.aboutService.update(id, {
      ...updateDto,
      image: imageUrl,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.aboutService.remove(id);
  }
}
