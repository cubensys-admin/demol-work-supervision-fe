import { httpClient } from '@/shared/api/httpClient';
import type { PaginatedNoticeSummary } from '@/entities/notice/model/types';

interface GetNoticesParams {
  page?: number;
  size?: number;
  title?: string;
  author?: string;
  content?: string;
  createdFrom?: string;
  createdTo?: string;
}

export async function getNotices({
  page = 0,
  size = 10,
  title,
  author,
  content,
  createdFrom,
  createdTo
}: GetNoticesParams = {}): Promise<PaginatedNoticeSummary> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  if (title) params.append('title', title);
  if (author) params.append('author', author);
  if (content) params.append('content', content);
  if (createdFrom) params.append('createdFrom', createdFrom);
  if (createdTo) params.append('createdTo', createdTo);

  const response = await httpClient.get<PaginatedNoticeSummary>(
    `/api/notices?${params.toString()}`
  );

  return response.data;
}
