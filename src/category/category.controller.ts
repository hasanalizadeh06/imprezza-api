import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ParseUUIDPipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryType } from '../common/enums/category-type.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enum/role.enum';

@Controller('categories')
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Create a category
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    if (!Object.values(CategoryType).includes(createCategoryDto.type)) {
      throw new BadRequestException(
        `Type must be one of: ${Object.values(CategoryType).join(', ')}`,
      );
    }

    return this.categoryService.create(createCategoryDto);
  }

  // Get all categories with pagination
  @Get()
  async findAll(
    @Query(
      'page',
      new ParseIntPipe({
        optional: true,
        exceptionFactory: () =>
          new BadRequestException('Page must be a valid number'),
      }),
    )
    page?: number,
    @Query(
      'limit',
      new ParseIntPipe({
        optional: true,
        exceptionFactory: () =>
          new BadRequestException('Limit must be a valid number'),
      }),
    )
    limit?: number,
  ): Promise<{ data: Category[]; count: number }> {
    if (page && page < 1) {
      throw new BadRequestException('Page must be greater than or equal to 1');
    }

    if (limit && limit < 1) {
      throw new BadRequestException('Limit must be greater than or equal to 1');
    }

    return this.categoryService.findAll(page, limit);
  }

  // Get a category by ID
  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: () =>
          new BadRequestException('Invalid UUID format for category ID'),
      }),
    )
    id: string,
  ): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  // Update a category by ID
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: () =>
          new BadRequestException('Invalid UUID format for category ID'),
      }),
    )
    id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    if (Object.keys(updateCategoryDto).length === 0) {
      throw new BadRequestException('No update fields provided');
    }

    if (
      updateCategoryDto.type &&
      !Object.values(CategoryType).includes(updateCategoryDto.type)
    ) {
      throw new BadRequestException(
        `Invalid category type. Valid types are: ${Object.values(CategoryType).join(', ')}`,
      );
    }

    return this.categoryService.update(id, updateCategoryDto);
  }

  // Delete a category by ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: () =>
          new BadRequestException('Invalid UUID format for category ID'),
      }),
    )
    id: string,
  ): Promise<void> {
    await this.categoryService.remove(id);
  }
}
