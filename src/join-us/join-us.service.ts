import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJoinUsDto } from './dto/create-join-us.dto';
import { UpdateJoinUsDto } from './dto/update-join-us.dto';
import { JoinUs } from './entities/join-us.entity';

@Injectable()
export class JoinUsService {
  constructor(
    @InjectRepository(JoinUs)
    private readonly joinUsRepository: Repository<JoinUs>,
  ) {}

  create(dto: CreateJoinUsDto) {
    const newJoin = this.joinUsRepository.create(dto);
    return this.joinUsRepository.save(newJoin);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: JoinUs[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.joinUsRepository.findAndCount({
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

  findOne(id: string) {
    return this.joinUsRepository.findOneBy({ id });
  }

  update(id: string, dto: UpdateJoinUsDto) {
    return this.joinUsRepository.update(id, dto);
  }

  remove(id: string) {
    return this.joinUsRepository.delete(id);
  }
}
