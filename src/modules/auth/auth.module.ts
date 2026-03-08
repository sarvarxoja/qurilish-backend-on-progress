import { Module } from '@nestjs/common';
import { User } from '../users/models/users.model';
import { Device } from '../users/models/device.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Device])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
