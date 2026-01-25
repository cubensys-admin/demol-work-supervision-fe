import { httpClient } from '@/shared/api/httpClient';

interface UpdateNoticeData {
  title: string;
  content: string;
  pinned?: boolean;
  retainAttachmentIds?: number[];
  attachments?: File[];
}

interface NoticeResponse {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt?: string;
  attachments?: {
    id: number;
    fileName: string;
    url: string;
  }[];
}

export async function updateNotice(id: number, data: UpdateNoticeData): Promise<NoticeResponse> {
  const formData = new FormData();
  
  // Add payload as JSON blob with proper content type
  const payload = {
    title: data.title,
    content: data.content,
    pinned: data.pinned || false,
    retainAttachmentIds: data.retainAttachmentIds || [],
  };
  const payloadBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  formData.append('payload', payloadBlob);
  
  // Add new attachments if any
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const response = await httpClient.put<NoticeResponse>(
    `/api/notices/${id}`,
    formData
  );

  return response.data;
}