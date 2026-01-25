import { httpClient } from '@/shared/api/httpClient';

interface UpdateResourceData {
  title: string;
  content: string;
  retainAttachmentIds?: number[];
  attachments?: File[];
}

interface ResourceResponse {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments?: {
    id: number;
    fileName: string;
    url: string;
  }[];
}

export async function updateResource(id: number, data: UpdateResourceData): Promise<ResourceResponse> {
  const formData = new FormData();
  
  // Add payload as JSON blob with proper content type
  const payload = {
    title: data.title,
    content: data.content,
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

  const response = await httpClient.put<ResourceResponse>(
    `/api/resources/${id}`,
    formData
  );

  return response.data;
}