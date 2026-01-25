import { httpClient } from '@/shared/api/httpClient';
import type { Recruitment } from '../model/types';

export async function getRecruitmentById(id: number): Promise<Recruitment> {
  const response = await httpClient.get<Recruitment>(`/api/recruitments/${id}`);
  return response.data;
}