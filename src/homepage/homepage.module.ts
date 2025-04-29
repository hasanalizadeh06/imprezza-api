import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Homepage } from './entities/homepage.entity';
import { HomepageService } from './homepage.service';
import { HomepageController } from './homepage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Homepage])],
  controllers: [HomepageController],
  providers: [HomepageService],
})
export class HomepageModule {}
