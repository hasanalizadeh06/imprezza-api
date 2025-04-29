import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/role.enum';

@Controller('availability')
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateAvailabilityDto) {
    return this.service.create(dto);
  }
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
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

    return this.service.findAll(pageNumber, limitNumber);
  }

  @Get('artist/:artistId/available')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  getArtistAvailableTimes(@Param('artistId') artistId: string) {
    return this.service.getArtistAvailableTimes(artistId);
  }

  @Get('artist/:artistId/booked')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  getArtistBookedTimes(@Param('artistId') artistId: string) {
    return this.service.getArtistBookedTimes(artistId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
