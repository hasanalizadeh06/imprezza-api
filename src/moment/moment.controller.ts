import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseFilters,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { MomentService } from './moment.service';
import { CreateMomentDto } from './dto/create-moment.dto';
import { UpdateMomentDto } from './dto/update-moment.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/enum/role.enum';

@Controller('moment')
@ApiTags('moments')
@ApiBearerAuth()
@UseFilters(AllExceptionsFilter)
export class MomentController {
  constructor(private readonly momentService: MomentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @ApiOperation({ summary: 'Create a new moment' })
  @ApiResponse({
    status: 201,
    description: 'The moment has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Validation error or bad request.' })
  create(@Body() dto: CreateMomentDto) {
    return this.momentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all moments (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'List of paginated moments.',
  })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.momentService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a moment by id' })
  @ApiResponse({ status: 404, description: 'Moment not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.momentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
    }),
  )
  @ApiOperation({ summary: 'Update a moment' })
  @ApiResponse({ status: 404, description: 'Moment not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMomentDto) {
    return this.momentService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a moment' })
  @ApiResponse({ status: 404, description: 'Moment not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.momentService.remove(id);
  }
}
