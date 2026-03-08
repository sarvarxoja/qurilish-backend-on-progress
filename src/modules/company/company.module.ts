import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Company } from './models/company.model';
import { CompanyController } from './company.controller';
import { CompanyService } from './service/company.service';
import { EsConnectionModule } from 'src/common/elasticsearch/es-connection.module';
import { User } from 'src/modules/users/models/users.model';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Company]),
    EsConnectionModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompaniesModule {}
