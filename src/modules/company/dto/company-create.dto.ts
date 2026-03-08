import {
  IsDateString,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class companyCreateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(3)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(3)
  tin: string;

  @IsNotEmpty()
  @IsDateString()
  company_created_date: Date;
}
