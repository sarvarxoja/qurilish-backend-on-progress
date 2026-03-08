import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { RedisService } from 'src/common/redis/cashe.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisConnectionModule {}
