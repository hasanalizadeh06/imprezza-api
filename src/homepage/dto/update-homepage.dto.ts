import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateHomepageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  heroImage: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ctaText: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  footerText: string;

  @ApiProperty()
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}
