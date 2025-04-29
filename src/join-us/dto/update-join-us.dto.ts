import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryType } from 'src/common/enums/category-type.enum';

export class UpdateJoinUsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsEnum(CategoryType, {
    message: 'Type must be one of: ' + Object.values(CategoryType).join(', '),
  })
  type: CategoryType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shortBio: string;
}
