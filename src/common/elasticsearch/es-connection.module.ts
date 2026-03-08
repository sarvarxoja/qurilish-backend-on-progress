import { Module, OnModuleInit, Logger, Global } from '@nestjs/common';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { EsService } from './es.service';

@Global()
@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
      auth: {
        username: 'elastic',
        password: 'lLA6nVmZWw3RUu1YZnfH',
      },
    }),
  ],
  providers: [EsService],
  exports: [EsService, ElasticsearchModule],
})
export class EsConnectionModule {}
