import { IsOptional } from 'class-validator';

export class userQueryDto {
  @IsOptional()
  query: string;

  @IsOptional()
  page: number;

  @IsOptional()
  limit: number;
}
