import { Expose, Type } from "class-transformer";
import { userResponseDto } from "./user-response.dto";

// users-pagination-response.dto.ts
export class UsersPaginationResponseDto {
  @Expose()
  @Type(() => userResponseDto) // Har bir elementni userResponseDto ga o'giradi
  data: userResponseDto[];

  @Expose()
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
  }; // Meta qismini ham ko'rsatish uchun
}