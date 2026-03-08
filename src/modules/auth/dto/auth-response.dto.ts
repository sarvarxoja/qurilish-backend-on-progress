import { Expose } from 'class-transformer';

export class AuthResponse {
  @Expose()
  id: string;

  @Expose()
  first_name: string;

  @Expose()
  middle_name: string;

  @Expose()
  last_name: string;

  @Expose()
  role: string;

  @Expose()
  phone_number: string;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken?: string;
}
