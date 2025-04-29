import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homepage } from './entities/homepage.entity';
import { CreateHomepageDto } from './dto/create-homepage.dto';
import { UpdateHomepageDto } from './dto/update-homepage.dto';

@Injectable()
export class HomepageService {
  constructor(
    @InjectRepository(Homepage)
    private readonly homepageRepo: Repository<Homepage>,
  ) {}

  async create(createDto: CreateHomepageDto): Promise<Homepage> {
    const homepage = this.homepageRepo.create(createDto);
    return this.homepageRepo.save(homepage);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: Homepage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.homepageRepo.findAndCount({
      skip,
      take: limit,
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

  async findOne(id: string): Promise<Homepage> {
    const homepage = await this.homepageRepo.findOne({ where: { id } });
    if (!homepage) throw new NotFoundException('Homepage entry not found');
    return homepage;
  }

  async update(id: string, updateDto: UpdateHomepageDto): Promise<Homepage> {
    const homepage = await this.findOne(id);
    const updated = this.homepageRepo.merge(homepage, updateDto);
    return this.homepageRepo.save(updated);
  }

  async remove(id: string): Promise<void> {
    const homepage = await this.findOne(id);
    await this.homepageRepo.remove(homepage);
  }
}
