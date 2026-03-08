import { JwtPayload } from 'jsonwebtoken';

export interface RefreshPayload extends JwtPayload {
  id: string;
  version: number;
  device_id: string;
}
