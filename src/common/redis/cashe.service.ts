import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis_client: Redis;

  async onModuleInit() {
    this.redis_client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.redis_client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.redis_client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    // 1. Ma'lumotni tekshiramiz: Agar u obyekt bo'lsa, JSON stringga aylantiramiz
    const dataToSave =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    // 2. Redisga saqlaymiz
    await this.redis_client.set(key, dataToSave, 'EX', ttl);
  }

  // redis.service.ts
  async get(key: string) {
    const data = await this.redis_client.get(key);
    if (!data) return null;

    try {
      // Agar ma'lumot JSON formatida bo'lsa, uni obyektga aylantiramiz
      return JSON.parse(data);
    } catch (e) {
      // Agar JSON bo'lmasa (oddiy string bo'lsa), o'zini qaytaramiz
      return data;
    }
  }

  async del(key: string) {
    await this.redis_client.del(key);
  }
}
