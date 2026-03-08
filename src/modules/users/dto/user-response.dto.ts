import { Expose, Type } from 'class-transformer';
import { companyResponseDto } from 'src/modules/company/dto/company-response.dto';
import { DeviceResponseDto } from './device-response.dto';

export class userResponseDto {
  @Expose()
  id: string;

  @Expose()
  role: string;

  @Expose()
  email: string;

  @Expose()
  first_name: string;

  @Expose()
  middle_name: string;

  @Expose()
  last_name: string;

  @Expose()
  phone_number: string;

  @Expose()
  @Type(() => companyResponseDto)
  company: companyResponseDto;

  @Expose()
  @Type(() => DeviceResponseDto)
  devices?: DeviceResponseDto[];
}
