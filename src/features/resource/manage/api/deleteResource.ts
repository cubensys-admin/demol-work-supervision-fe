import { httpClient } from '@/shared/api/httpClient';

export async function deleteResource(id: number): Promise<void> {
  await httpClient.delete(`/api/resources/${id}`);
}