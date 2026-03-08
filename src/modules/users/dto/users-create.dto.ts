import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from '@nestjs/class-validator';

export class createUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(3)
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(3)
  middle_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(3)
  last_name: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('UZ')
  phone_number: string;

  @IsNotEmpty()
  @IsUUID()
  company_id: string;

  @IsOptional()
  @IsEnum(['USER', 'CAMPANY_ADMIN', 'ADMIN'])
  role: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @MinLength(4)
  password: string;
}