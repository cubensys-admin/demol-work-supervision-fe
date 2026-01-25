import { httpClient } from '@/shared/api/httpClient';

import type {
  PaginatedUserSummary,
  UserDetail,
  UserUpdateRequest,
} from '../model/types';

export async function getUsers(params: { page?: number; size?: number } = {}) {
  const response = await httpClient.get<PaginatedUserSummary>('/api/users', {
    params,
  });
  return response.data;
}

export async function getUserById(id: number) {
  const response = await httpClient.get<UserDetail>(`/api/users/${id}`);
  return response.data;
}

export async function updateUser(id: number, payload: UserUpdateRequest) {
  const response = await httpClient.put<UserDetail>(`/api/users/${id}`, payload);
  return response.data;
}
