import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepo: Repository<Faq>,
  ) {}

  create(createDto: CreateFaqDto) {
    const faq = this.faqRepo.create(createDto);
    return this.faqRepo.save(faq);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: Faq[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.faqRepo.findAndCount({
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

  async findOne(id: string) {
    const faq = await this.faqRepo.findOneBy({ id });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async update(id: string, updateDto: UpdateFaqDto) {
    const faq = await this.findOne(id);
    const updated = this.faqRepo.merge(faq, updateDto);
    return this.faqRepo.save(updated);
  }

  async remove(id: string) {
    const faq = await this.findOne(id);
    return this.faqRepo.remove(faq);
  }
}
