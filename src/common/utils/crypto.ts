import * as bcrypt from 'bcrypt';

export class CryptoHelper {
  private static readonly SALT_ROUNDS = 10;

  // Parolni hashlash (Encode)
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Parolni tekshirish (Compare)
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}