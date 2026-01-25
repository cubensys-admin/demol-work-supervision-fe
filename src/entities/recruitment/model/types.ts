export type RecruitmentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "RECRUITING"
  | "CLOSED";

export interface RecruitmentAttachmentDto {
  id: number;
  fileName: string;
  url?: string;
}

export interface RecruitmentAttachment {
  id: number;
  fileName: string;
  url?: string;
}

export interface RecruitmentDto {
  id: number;
  periodNumber: number;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  executionStartDate?: string;
  executionEndDate?: string;
  status: RecruitmentStatus;
  statusDescription?: string;
  attachmentPath?: string;
  attachmentName?: string;
  attachments?: RecruitmentAttachmentDto[];
  createdById?: number;
  createdByUsername?: string;
  createdByRole?: string;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
  isActive?: boolean;
  applicantCount?: number;
  viewCount?: number;
}

export interface Recruitment {
  id: number;
  periodNumber: number;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  executionStartDate?: string;
  executionEndDate?: string;
  status: RecruitmentStatus;
  statusDescription?: string;
  attachmentName?: string;
  attachmentPath?: string;
  attachmentUrl?: string;
  attachments?: RecruitmentAttachment[];
  createdById?: number;
  createdByUsername?: string;
  createdByRole?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  applicantCount?: number;
  viewCount?: number;
}

export interface RecruitmentListParams {
  page?: number;
  size?: number;
  title?: string;
  author?: string;
  content?: string;
  createdFrom?: string; // YYYY-MM-DD
  createdTo?: string;   // YYYY-MM-DD
}

export interface RecruitmentListResponse {
  content: Recruitment[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RecruitmentPageRaw {
  content?: RecruitmentDto[];
  items?: RecruitmentDto[];
  records?: RecruitmentDto[];
  totalElements?: number | string;
  totalPages?: number | string;
  totalCount?: number | string;
  pages?: number | string;
  count?: number | string;
  size?: number | string;
  pageSize?: number | string;
  number?: number | string;
  page?: number | string;
  pageIndex?: number | string;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  numberOfElements?: number;
  pageable?: unknown;
  sort?: unknown;
}
