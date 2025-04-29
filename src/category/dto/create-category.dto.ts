import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CategoryType } from '../../common/enums/category-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    enum: CategoryType,
    description: 'Type of the category',
    example: 'Live Performance',
  })
  @IsEnum(CategoryType, {
    message: `Type must be one of: ${Object.values(CategoryType).join(', ')}`,
  })
  type: CategoryType;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Evening Show',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @ApiProperty({
    required: false,
    description: 'Optional description of the category',
    example: 'An evening performance featuring local artists',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
