import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityNotFoundError } from 'typeorm';
import { Moment } from './entities/moment.entity';
import { CreateMomentDto } from './dto/create-moment.dto';
import { UpdateMomentDto } from './dto/update-moment.dto';
import { Category } from '../category/entities/category.entity';
import { Artist } from '../artist/entities/artist.entity';

@Injectable()
export class MomentService {
  constructor(
    @InjectRepository(Moment)
    private readonly momentRepository: Repository<Moment>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async create(dto: CreateMomentDto): Promise<Moment> {
    try {
      // Validate date format
      if (!this.isValidDateFormat(dto.date)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      const category = await this.categoryRepository.findOneBy({
        id: dto.categoryId,
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${dto.categoryId} not found`,
        );
      }

      const artist = await this.artistRepository.findOneBy({
        id: dto.artistId,
      });

      if (!artist) {
        throw new NotFoundException(`Artist with ID ${dto.artistId} not found`);
      }

      const moment = this.momentRepository.create({
        ...dto,
        category,
        artist,
      });

      return await this.momentRepository.save(moment);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async findAll({ page, limit }: { page: number; limit: number }): Promise<{
    data: Moment[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      const [data, total] = await this.momentRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { date: 'DESC' }, // Feel free to tweak or remove this if needed
        relations: ['category', 'artist'], // load relations if you want full objects
      });

      return {
        data,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new BadRequestException(`Error fetching moments: ${error.message}`);
    }
  }

  async update(id: string, dto: UpdateMomentDto): Promise<Moment> {
    try {
      const moment = await this.findOne(id);

      // Validate date format if provided
      if (dto.date && !this.isValidDateFormat(dto.date)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      if (dto.categoryId) {
        const category = await this.categoryRepository.findOneBy({
          id: dto.categoryId,
        });

        if (!category) {
          throw new NotFoundException(
            `Category with ID ${dto.categoryId} not found`,
          );
        }

        moment.category = category;
      }

      if (dto.artistId) {
        const artist = await this.artistRepository.findOneBy({
          id: dto.artistId,
        });

        if (!artist) {
          throw new NotFoundException(
            `Artist with ID ${dto.artistId} not found`,
          );
        }

        moment.artist = artist;
      }

      Object.assign(moment, dto);
      return await this.momentRepository.save(moment);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error updating moment: ${error.message}`);
    }
  }
  async findOne(id: string): Promise<Moment> {
    const moment = await this.momentRepository.findOne({
      where: { id },
      relations: ['category', 'artist'], // Load relations if needed
    });

    if (!moment) {
      throw new NotFoundException(`Moment with ID ${id} not found`);
    }

    return moment;
  }

  async remove(id: string): Promise<void> {
    const moment = await this.findOne(id);
    await this.momentRepository.remove(moment);
  }

  /**
   * Validates if the date is in YYYY-MM-DD format
   */
  private isValidDateFormat(date: string): boolean {
    // Check if it matches YYYY-MM-DD pattern
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }

    // Check if the date is valid (not like 2025-13-40)
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }
}
