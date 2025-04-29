import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Artist } from 'src/artist/entities/artist.entity';
import { Moment } from 'src/moment/entities/moment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Artist, Moment])],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}
