import { UserPublic } from "./user-public.interface";

export interface PaginatedUserResponse {
  data: UserPublic[];
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}
