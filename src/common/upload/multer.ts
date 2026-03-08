import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';

const MAX_COMPANY_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

export const companyDocumentMulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = join(process.cwd(), 'uploads', 'companies');
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const safeExt = extname(file.originalname).toLowerCase();
      const fileName = `${randomUUID()}${safeExt || '.pdf'}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req: unknown, file: Express.Multer.File, cb: Function) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      extname(file.originalname).toLowerCase() === '.pdf';

    if (!isPdf) {
      return cb(
        new BadRequestException('Faqat PDF fayl yuklash mumkin'),
        false,
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: MAX_COMPANY_PDF_SIZE,
  },
};
