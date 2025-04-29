import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateArtistDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => {
    try {
      // If value is a string, transform it into an array of tags
      return typeof value === 'string'
        ? value.split(',').map((tag) => tag.trim())
        : value;
    } catch {
      return value;
    }
  })
  tags: string[];

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(5)
  stars: number;

  @ApiProperty()
  @IsString()
  price: string;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file',
  })
  image: string;
}
