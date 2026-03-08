import { Expose } from 'class-transformer';

export class companyResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  tin: string;

  @Expose()
  company_created_date: Date;

  @Expose()
  document: string;
}
