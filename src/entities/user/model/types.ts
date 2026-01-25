import type { UserRole } from '@/shared/model/authStore';

export interface UserSummary {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  department?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserDetail = UserSummary;

export interface PaginatedUserSummary {
  content: UserSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserUpdateRequest {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
}
