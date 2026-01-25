import { httpClient } from '@/shared/api/httpClient';

interface CreateResourceData {
  title: string;
  content: string;
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

export async function createResource(data: CreateResourceData): Promise<ResourceResponse> {
  const formData = new FormData();
  
  // Add payload as JSON blob with proper content type
  const payload = {
    title: data.title,
    content: data.content,
  };
  const payloadBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  formData.append('payload', payloadBlob);
  
  // Add attachments if any
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const response = await httpClient.post<ResourceResponse>(
    '/api/resources',
    formData
  );

  return response.data;
}