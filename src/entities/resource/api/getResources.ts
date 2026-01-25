import { httpClient } from '@/shared/api/httpClient';
import type { GetResourcesParams, PaginatedResourceSummary } from '../model/types';

export async function getResources(params: GetResourcesParams = {}): Promise<PaginatedResourceSummary> {
  const { page = 0, size = 20, title, author, content, createdFrom, createdTo } = params;

  const queryParams: Record<string, string | number> = { page, size };
  if (title) queryParams.title = title;
  if (author) queryParams.author = author;
  if (content) queryParams.content = content;
  if (createdFrom) queryParams.createdFrom = createdFrom;
  if (createdTo) queryParams.createdTo = createdTo;

  const response = await httpClient.get<PaginatedResourceSummary>('/api/resources', {
    params: queryParams,
  });
  return response.data;
}
