import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { About } from './entities/about.entity';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private readonly aboutRepo: Repository<About>,
  ) {}

  async create(createDto: CreateAboutDto): Promise<About> {
    const about = this.aboutRepo.create(createDto);
    return this.aboutRepo.save(about);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: About[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.aboutRepo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
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

  async findOne(id: string): Promise<About> {
    const about = await this.aboutRepo.findOneBy({ id });
    if (!about) throw new NotFoundException('About not found');
    return about;
  }

  async update(id: string, updateDto: UpdateAboutDto): Promise<About> {
    const about = await this.findOne(id);
    if (!about) throw new NotFoundException('About not found');

    Object.assign(about, updateDto);
    return this.aboutRepo.save(about);
  }

  async remove(id: string): Promise<void> {
    const result = await this.aboutRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('About not found');
  }
}
