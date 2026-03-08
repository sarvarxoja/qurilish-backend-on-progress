import { Module } from '@nestjs/common';
import { User } from './models/users.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { Company } from 'src/modules/company/models/company.model';
import { EsConnectionModule } from 'src/common/elasticsearch/es-connection.module';
import { Device } from './models/device.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Company, Device]), EsConnectionModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
