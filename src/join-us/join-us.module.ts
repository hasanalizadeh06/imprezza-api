import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinUsService } from './join-us.service';
import { JoinUsController } from './join-us.controller';
import { JoinUs } from './entities/join-us.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JoinUs])],
  controllers: [JoinUsController],
  providers: [JoinUsService],
})
export class JoinUsModule {}
