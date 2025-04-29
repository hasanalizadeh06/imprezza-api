import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Category])],
  providers: [ArtistService],
  controllers: [ArtistController],
})
export class ArtistModule {}
