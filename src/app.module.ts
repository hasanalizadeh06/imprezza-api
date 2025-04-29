import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CategoryModule } from './category/category.module';
import { AboutModule } from './about/about.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ArtistModule } from './artist/artist.module';
import { AvailabilityModule } from './availability/availability.module';
import { S3Module } from './s3/s3.module';
import { HomepageModule } from './homepage/homepage.module';
import { MomentModule } from './moment/moment.module';
import { JoinUsModule } from './join-us/join-us.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CategoryModule,
    AboutModule,
    ContactModule,
    FaqModule,
    HomepageModule,
    AuthModule,
    ProfileModule,
    ArtistModule,
    AvailabilityModule,
    S3Module,
    MomentModule,
    JoinUsModule,
  ],
})
export class AppModule {}
