import { httpClient } from '@/shared/api/httpClient';

export async function deleteNotice(id: number): Promise<void> {
  await httpClient.delete(`/api/notices/${id}`);
}