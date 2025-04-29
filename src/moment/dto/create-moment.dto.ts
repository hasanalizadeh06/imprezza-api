import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsDateString,
  IsOptional,
  Matches,
  IsTimeZone,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMomentDto {
  @ApiProperty({ description: 'UUID of the category' })
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  categoryId: string;

  @ApiProperty({ description: 'UUID of the artist' })
  @IsUUID('4', { message: 'artistId must be a valid UUID' })
  artistId: string;

  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2025-04-24',
  })
  @IsDateString(
    {},
    {
      message: 'Date must be a valid ISO date string (e.g., YYYY-MM-DD)',
    },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    return value;
  })
  date: string;

  @ApiProperty({
    description: 'Start time in HH:MM format (24-hour)',
    example: '09:00',
  })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format (24-hour)',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:MM format (24-hour)',
    example: '17:00',
  })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format (24-hour)',
  })
  endTime: string;

  @ApiProperty({ description: 'Location of the moment' })
  @IsString({ message: 'Location must be a string' })
  location: string;

  @ApiProperty({
    description: 'Optional message for the moment',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Message must be a string when provided' })
  message?: string;
}
