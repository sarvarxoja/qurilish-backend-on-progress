import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { 
  UniqueConstraintError, 
  ForeignKeyConstraintError, 
  ValidationError 
} from 'sequelize';

// PostgreSQL xatoliklari uchun interfeys
interface PostgresError extends Error {
  detail?: string;
  table?: string;
  constraint?: string;
}

@Catch(UniqueConstraintError, ForeignKeyConstraintError, ValidationError)
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Maʼlumotlar bazasida xatolik yuz berdi';
    let errors: any = null;

    // 1. Foreign Key Constraint (Sizdagi xato)
    if (exception instanceof ForeignKeyConstraintError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Bog‘langan maʼlumot topilmadi (Foreign Key xatosi)';
      
      // 'parent'ni PostgresError tipiga o'tkazamiz (casting)
      const parent = exception.parent as PostgresError;
      
      errors = {
        field: exception.fields || exception.index,
        // Endi 'detail' xato bermaydi
        detail: parent?.detail || 'Berilgan ID bo‘yicha bog‘liq maʼlumot bazada mavjud emas',
      };
    } 
    
    // 2. Unique Constraint (Masalan: email band bo'lsa)
    else if (exception instanceof UniqueConstraintError) {
      status = HttpStatus.CONFLICT;
      message = 'Maʼlumot allaqachon mavjud';
      errors = exception.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
    }

    // 3. Umumiy Validation xatolari
    else if (exception instanceof ValidationError) {
      errors = exception.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      errors: errors,
      timestamp: new Date().toISOString(),
    });
  }
}