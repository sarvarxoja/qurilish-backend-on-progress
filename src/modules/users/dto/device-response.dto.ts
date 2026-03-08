import { Expose } from 'class-transformer';

export class DeviceResponseDto {
  @Expose()
  id: string;

  @Expose()
  device_id: string;

  @Expose()
  deviceName?: string | null;

  @Expose()
  browser?: string | null;

  @Expose()
  os?: string | null;

  @Expose()
  ip?: string | null;

  @Expose()
  lastLogin?: Date;

  @Expose()
  user_id: string;
}