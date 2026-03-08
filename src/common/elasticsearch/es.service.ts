import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IBaseEntity } from '../interfaces/entity.interface';

@Injectable()
export class EsService {
  private readonly logger = new Logger(EsService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  // Ma'lumot qo'shish yoki yangilash (Generic T orqali)
  async index<T extends IBaseEntity>(indexName: string, data: T) {
    try {
      return await this.elasticsearchService.index({
        index: indexName,
        id: data.id.toString(), // ID bo'lsa uni stringga o'tkazamiz
        document: data,
      });
    } catch (error) {
      this.logger.error(
        `Error indexing data to ${indexName}: ${error.message}`,
      );
      throw error;
    }
  }

  // Ma'lumotni o'chirish
  async remove(indexName: string, id: string) {
    try {
      return await this.elasticsearchService.delete({
        index: indexName,
        id: id,
      });
    } catch (error) {
      // Agar ma'lumot topilmasa xato bermasligi uchun tekshiramiz
      this.logger.error(`Error deleting from ${indexName}: ${error.message}`);
    }
  }

  // Qidiruv funksiyasi
  async search(indexName: string, searchBody: any) {
    try {
      const result = await this.elasticsearchService.search({
        index: indexName,
        ...searchBody,
      });

      // ES 8.x versiyada natijani soddalashtirib qaytarish
      return {
        hits: result.hits.hits.map((hit) => hit._source),
        total:
          typeof result.hits.total === 'object'
            ? result.hits.total.value
            : result.hits.total,
      };
    } catch (error) {
      this.logger.error(`Search error in ${indexName}: ${error.message}`);
      return { hits: [], total: 0 };
    }
  }
}
