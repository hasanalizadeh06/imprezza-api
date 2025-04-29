import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from './moment.service';
import { MomentController } from './moment.controller';
import { Moment } from './entities/moment.entity';
import { Category } from '../category/entities/category.entity';
import { Artist } from '../artist/entities/artist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Moment, Category, Artist])],
  controllers: [MomentController],
  providers: [MomentService],
})
export class MomentModule {}
