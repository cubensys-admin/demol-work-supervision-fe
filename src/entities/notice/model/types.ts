export interface NoticeSummary {
  id: number;
  title: string;
  pinned: boolean;
  createdBy: string;
  createdAt: string;
  viewCount: number;
  attachmentCount: number;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: {
    id: number;
    fileName: string;
    fileSize: number;
    url: string;
  }[];
}

export interface NoticeCreateRequest {
  title: string;
  content: string;
  pinned?: boolean;
}

export interface NoticeUpdateRequest {
  title: string;
  content: string;
  pinned?: boolean;
  retainAttachmentIds?: number[];
}

export interface PaginatedNoticeSummary {
  content: NoticeSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}