import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import {  ValidationPipe } from '@nestjs/common'; // 1. Buni import qiling
import { SequelizeExceptionFilter } from './common/filters/sequelize-exception.filter';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // 2. Global validatorni yoqing
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOda yo'q ortiqcha maydonlarni o'chirib tashlaydi
      forbidNonWhitelisted: true, // Ortiqcha maydon yuborilsa xato qaytaradi
      transform: true, // Kelayotgan ma'lumotni DTO tipiga avtomatik o'tkazadi
    }),
  );
  app.useGlobalFilters(new SequelizeExceptionFilter());
  app.enableCors({
    origin: 'http://localhost:3000', // Frontend manzili
    credentials: true, // Cookielarga ruxsat berish
  });
  // app.useGlobalInterceptors(
  //   new ClassSerializerInterceptor(app.get('Reflector'), {
  //     excludeExtraneousValues: true
  //   }),
  // );

  await app.listen(port, () =>
    console.log(`🚀 Server is running on ${port} port`),
  );
}
bootstrap();
