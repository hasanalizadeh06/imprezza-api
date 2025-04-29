import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Category } from 'src/category/entities/category.entity';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    private readonly s3Service: S3Service,
  ) {}

  async create(
    createDto: CreateArtistDto,
    file?: Express.Multer.File,
  ): Promise<Artist> {
    const category = await this.categoryRepo.findOneBy({
      id: createDto.categoryId,
    });
    if (!category) throw new NotFoundException('Category not found');

    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.s3Service.uploadFile(file, 'artists');
    }

    const artist = this.artistRepo.create({
      ...createDto,
      category,
      image: imageUrl,
    });

    return this.artistRepo.save(artist);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: Artist[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.artistRepo.findAndCount({
      skip,
      take: limit,
      relations: ['availability'],
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.artistRepo.findOne({
      where: { id },
      relations: ['availability'],
    });
    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }

  async update(
    id: string,
    updateDto: UpdateArtistDto,
    file?: Express.Multer.File,
  ): Promise<Artist> {
    const artist = await this.findOne(id);
    if (!artist) throw new NotFoundException('Artist not found');

    if (file) {
      const imageUrl = await this.s3Service.uploadFile(file, 'artists');
      if (imageUrl) {
        artist.image = imageUrl;
      }
    }

    Object.assign(artist, updateDto);
    return this.artistRepo.save(artist);
  }

  async remove(id: string): Promise<void> {
    const result = await this.artistRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Artist not found');
  }
}
