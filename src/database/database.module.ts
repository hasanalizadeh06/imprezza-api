import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Category } from 'src/category/entities/category.entity';
import { About } from 'src/about/entities/about.entity';
import { Contact } from 'src/contact/entities/contact.entity';
import { Faq } from 'src/faq/entities/faq.entity';
import { User } from 'src/users/entities/user.entity';
import { Artist } from 'src/artist/entities/artist.entity';
import { Availability } from 'src/availability/entities/availability.entity';
import { Homepage } from 'src/homepage/entities/homepage.entity';
import { Moment } from 'src/moment/entities/moment.entity';
import { JoinUs } from 'src/join-us/entities/join-us.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: parseInt(config.get<string>('DATABASE_PORT')!),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [
          Category,
          About,
          Contact,
          Faq,
          Homepage,
          User,
          Artist,
          Availability,
          Moment,
          JoinUs,
          __dirname + '/**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
