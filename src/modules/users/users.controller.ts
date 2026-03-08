import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { userQueryDto } from './dto/user-query.dto';
import { createUserDto } from './dto/users-create.dto';

import { UsersService } from './services/users.service';
import { idParamDto } from 'src/common/dtos/id-param.dto';
import { userResponseDto } from './dto/user-response.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UsersPaginationResponseDto } from './dto/users-pagination-response.dto';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: createUserDto): Promise<userResponseDto> {
    const user = await this.userService.create(createUserDto);
    return plainToInstance(userResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(
    @Query() userQueryDto: userQueryDto,
  ): Promise<UsersPaginationResponseDto> {
    let user = await this.userService.findAll(userQueryDto);
    return plainToInstance(UsersPaginationResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/:id')
  @Roles('USER')
  async findOne(@Param() paramDto: idParamDto): Promise<userResponseDto> {
    const user = await this.userService.findOne(paramDto);

    return plainToInstance(userResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param() paramDto: idParamDto) {
    return await this.userService.remove(paramDto.id);
  }
}
