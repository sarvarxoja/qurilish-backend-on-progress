import { IsNotEmpty, IsUUID } from 'class-validator';

export class idParamDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
