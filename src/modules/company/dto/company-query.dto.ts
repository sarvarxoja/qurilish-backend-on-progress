import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class companyQueryDto {
  @IsOptional()
  name: string;

  @IsOptional()
  tin: string;

  @IsOptional()
  @IsDateString()
  company_created_date: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}
