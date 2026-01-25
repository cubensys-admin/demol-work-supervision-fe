import { httpClient } from '@/shared/api/httpClient';
import type { Resource } from '../model/types';

export async function getResourceById(id: number): Promise<Resource> {
  const response = await httpClient.get<Resource>(`/api/resources/${id}`);
  return response.data;
}