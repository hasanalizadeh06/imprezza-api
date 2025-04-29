import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { About } from './entities/about.entity';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';

@Module({
  imports: [TypeOrmModule.forFeature([About])],
  controllers: [AboutController],
  providers: [AboutService],
})
export class AboutModule {}
