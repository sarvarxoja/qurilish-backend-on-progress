import * as jwt from 'jsonwebtoken';
import { RefreshInterface } from 'src/modules/auth/interfaces/refresh-interface';

export class JwtHelper {
  // expiresIn son (sekund) yoki satr ("7d") ko'rinishida bo'lishi mumkin
  private static readonly expiresIn = 7 * 24 * 60 * 60; // 7 kun
  private static readonly refreshExpiresIn = 30 * 24 * 60 * 60; // Masalan 10 kun

  static async jwtSign(
    id: string,
    version?: number,
    company_id?: string,
    device_id?: string,
  ): Promise<string> {
    const SECRET_KEY = process.env.SECRET_KEY;

    if (!SECRET_KEY) {
      throw new Error('SECRET_KEY topilmadi! .env faylni tekshiring.');
    }

    // jwt.sign(payload, secret, options)
    const jwtData = jwt.sign(
      { id, version, company_id, device_id },
      SECRET_KEY,
      {
        expiresIn: this.expiresIn, // Kalit so'z (expiresIn) majburiy
      },
    );

    return jwtData;
  }

  static async jwtRefreshSign(
    id: string,
    version?: number,
    device_id?: string,
  ): Promise<string> {
    const REFRESH_KEY = process.env.REFRESH_KEY;

    if (!REFRESH_KEY) {
      throw new Error('REFRESH_KEY topilmadi! .env faylni tekshirish');
    }

    const jwtData = jwt.sign({ id, version, device_id }, REFRESH_KEY, {
      expiresIn: this.refreshExpiresIn,
    });

    return jwtData;
  }

  static async jwtVerify(token: string): Promise<RefreshInterface> {
    const SECRET_KEY = process.env.SECRET_KEY;

    if (!SECRET_KEY) {
      throw new Error('SECRET_KEY topilmadi! .env faylni tekshiring.');
    }

    try {
      // jwt.verify - tokenni kalit bilan solishtiradi va muddatini tekshiradi
      const payload = jwt.verify(token, SECRET_KEY) as RefreshInterface;
      
      return payload;
    } catch (error) {
      throw error;
    }
  }
}
