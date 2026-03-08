import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { join } from 'path';
import type { Express } from 'express';
import { plainToInstance } from 'class-transformer';
import { idParamDto } from 'src/common/dtos/id-param.dto';
import { CompanyService } from './service/company.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { companyCreateDto } from './dto/company-create.dto';
import { companyResponseDto } from './dto/company-response.dto';
import { companyDocumentMulterOptions } from 'src/common/upload/multer';
import { companyQueryDto } from './dto/company-query.dto';

@Controller('/api/companies')
export class CompanyController {
  constructor(private readonly CompanyService: CompanyService) {}

  @Post()
  @UseInterceptors(FileInterceptor('document', companyDocumentMulterOptions))
  async create(
    @Body() createDto: companyCreateDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<companyResponseDto> {
    if (!file) {
      throw new BadRequestException('PDF fayl yuborilishi shart');
    }

    const documentPath = join('uploads', 'companies', file.filename);
    let company = await this.CompanyService.create(createDto, documentPath);
    return plainToInstance(companyResponseDto, company, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(@Query() companyQueryDto: companyQueryDto) {
    return await this.CompanyService.findAll(companyQueryDto);
  }

  @Get('/:id')
  async findOne(@Param() paramDto: idParamDto): Promise<companyResponseDto> {
    let company = await this.CompanyService.findOne(paramDto);
    return plainToInstance(companyResponseDto, company, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/:id')
  async remove(@Param() paramDto: idParamDto) {
    return await this.CompanyService.remove(paramDto);
  }
}
