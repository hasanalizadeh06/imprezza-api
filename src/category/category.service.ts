import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      // Check if category with same name and type already exists
      const existing = await this.categoryRepository.findOne({
        where: {
          name: createCategoryDto.name,
          type: createCategoryDto.type,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Category with name "${createCategoryDto.name}" and type "${createCategoryDto.type}" already exists`,
        );
      }

      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create category: ${error.message}`,
      );
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Category[]; count: number }> {
    try {
      const [data, count] = await this.categoryRepository.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
        order: {
          createdAt: 'DESC',
        },
      });
      return { data, count };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve categories: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(`Category with ID "${id}" not found`);
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to retrieve category: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      // Check if category exists
      const category = await this.findOne(id);

      // If name or type is being updated, check for conflicts
      if (updateCategoryDto.name || updateCategoryDto.type) {
        const type = updateCategoryDto.type || category.type;
        const name = updateCategoryDto.name || category.name;

        const existing = await this.categoryRepository.findOne({
          where: {
            name: name,
            type: type,
            id: Not(id),
          },
        });

        if (existing) {
          throw new ConflictException(
            `Category with name "${name}" and type "${type}" already exists`,
          );
        }
      }

      await this.categoryRepository.update(id, updateCategoryDto);
      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update category: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Check if category exists
      await this.findOne(id);

      const result = await this.categoryRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Category with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete category: ${error.message}`,
      );
    }
  }
}
