import { publicApiClient } from "./client";
import type {
  PaginatedResponse,
  PaginationParams,
  NoticeFilterParams,
  ResourceFilterParams,
  RecruitmentSummary,
  RecruitmentDetail,
  NoticeSummary,
  NoticeDetail,
  ResourceSummary,
  ResourceDetail,
} from "./types";

/**
 * Public API functions for non-authenticated access
 */

// Recruitment APIs
export const getPublicRecruitments = async (
  params?: PaginationParams
): Promise<PaginatedResponse<RecruitmentSummary>> => {
  const response = await publicApiClient.get("/api/recruitments", { params });
  return response.data;
};

export const getPublicRecruitmentDetail = async (
  id: number
): Promise<RecruitmentDetail> => {
  const response = await publicApiClient.get(`/api/recruitments/${id}`);
  return response.data;
};

// Notice APIs
export const getPublicNotices = async (
  params?: NoticeFilterParams
): Promise<PaginatedResponse<NoticeSummary>> => {
  const response = await publicApiClient.get("/api/notices", { params });
  return response.data;
};

export const getPublicNoticeDetail = async (id: number): Promise<NoticeDetail> => {
  const response = await publicApiClient.get(`/api/notices/${id}`);
  return response.data;
};

// Resource (Archives) APIs
export const getPublicResources = async (
  params?: ResourceFilterParams
): Promise<PaginatedResponse<ResourceSummary>> => {
  const response = await publicApiClient.get("/api/resources", { params });
  return response.data;
};

export const getPublicResourceDetail = async (
  id: number
): Promise<ResourceDetail> => {
  const response = await publicApiClient.get(`/api/resources/${id}`);
  return response.data;
};

// Attachment download
export const getAttachmentDownloadUrl = (attachmentId: number, type: 'recruitment' | 'notice' | 'resource'): string => {
  const baseUrl = publicApiClient.defaults.baseURL || '';

  switch (type) {
    case 'recruitment':
      return `${baseUrl}/api/recruitments/attachments/${attachmentId}`;
    case 'notice':
      return `${baseUrl}/api/notices/attachments/${attachmentId}`;
    case 'resource':
      return `${baseUrl}/api/resources/attachments/${attachmentId}`;
    default:
      return '';
  }
};

// Re-export types
export type * from "./types";
