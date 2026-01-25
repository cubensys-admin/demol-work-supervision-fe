// Common pagination types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface NoticeFilterParams extends PaginationParams {
  title?: string;
  author?: string;
  content?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface ResourceFilterParams extends PaginationParams {
  title?: string;
  author?: string;
  content?: string;
  createdFrom?: string;
  createdTo?: string;
}

// Recruitment types
export interface RecruitmentSummary {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  executionStartDate: string;
  executionEndDate: string;
  createdAt: string;
  viewCount?: number;
  createdByUsername?: string;
}

export interface RecruitmentDetail extends RecruitmentSummary {
  content: string;
  attachments: Attachment[];
}

// Notice types
export interface NoticeSummary {
  id: number;
  title: string;
  pinned: boolean;
  createdBy: string;
  createdAt: string;
  viewCount: number;
}

export interface NoticeDetail extends NoticeSummary {
  content: string;
  attachments: Attachment[];
}

// Resource types
export interface ResourceSummary {
  id: number;
  title: string;
  createdAt: string;
  viewCount: number;
}

export interface ResourceDetail extends ResourceSummary {
  content: string;
  attachments: Attachment[];
}

// Common attachment type
export interface Attachment {
  id: number;
  fileName: string;
  filename?: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  downloadUrl?: string;
  url?: string;
}
