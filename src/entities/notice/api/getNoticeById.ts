import { httpClient } from '@/shared/api/httpClient';
import type { Notice } from '@/entities/notice/model/types';

export async function getNoticeById(id: number): Promise<Notice> {
  const response = await httpClient.get<Notice>(`/api/notices/${id}`);
  return response.data;
}