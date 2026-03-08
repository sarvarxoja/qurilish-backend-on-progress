import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/company/company.module';

import { RedisConnectionModule } from './common/redis/redis-connection.module';
import { EsConnectionModule } from './common/elasticsearch/es-connection.module';
import { PsqlConnectionModule } from './common/psql-connection/psql-connection.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { User } from './modules/users/models/users.model';
import { Device } from './modules/users/models/device.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env`,
    }),
    SequelizeModule.forFeature([User, Device]),
    PsqlConnectionModule,
    EsConnectionModule,
    RedisConnectionModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
