import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: +config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASS'),
        database: config.getOrThrow<string>('DB_NAME'),

        autoLoadModels: true,
        synchronize: true, // productionda false
        // sync: ({force:true}),
        logging: (sql: string) => {
          console.log('✅ Sequelize successfully connected to PostgreSQL.');
        },

        pool: {
          max: 20,
          min: 5,
          acquire: 30000,
          idle: 10000,
        },
      }),
    }),
  ],
})
export class PsqlConnectionModule {}
