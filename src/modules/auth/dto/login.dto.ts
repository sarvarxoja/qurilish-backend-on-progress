import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsPhoneNumber('UZ')
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @MinLength(4)
  password: string;

  @IsNotEmpty()
  @IsString()
  device_id: string;
}
