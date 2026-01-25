export interface ResourceAttachment {
  id: number;
  fileName: string;
  url: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface Resource {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  attachments: ResourceAttachment[];
}

export interface ResourceSummary {
  id: number;
  title: string;
  createdBy: string;
  createdAt: string;
  viewCount: number;
  attachmentCount: number;
}

export interface PaginatedResourceSummary {
  content: ResourceSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface GetResourcesParams {
  page?: number;
  size?: number;
  title?: string;
  author?: string;
  content?: string;
  createdFrom?: string;
  createdTo?: string;
}
