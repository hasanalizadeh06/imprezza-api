import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CategoryType } from '../../common/enums/category-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({
    required: false,
    enum: CategoryType,
    description: 'Type of the category',
    enumName: 'CategoryType',
  })
  @IsOptional()
  @IsEnum(CategoryType, {
    message: `Type must be one of: ${Object.values(CategoryType).join(', ')}`,
  })
  type?: CategoryType;

  @ApiProperty({
    required: false,
    description: 'Name of the category',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty when provided' })
  name?: string;

  @ApiProperty({
    required: false,
    description: 'Description of the category',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
