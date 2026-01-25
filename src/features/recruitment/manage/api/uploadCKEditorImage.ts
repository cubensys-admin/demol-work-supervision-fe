import { httpClient } from '@/shared/api/httpClient';

interface CKEditorUploadResponse {
  uploaded: number;
  fileName: string;
  url: string;
}

export async function uploadCKEditorImage(file: File): Promise<CKEditorUploadResponse> {
  const formData = new FormData();
  formData.append('upload', file);

  const response = await httpClient.post<CKEditorUploadResponse>(
    '/api/recruitments/ckeditor/upload',
    formData
  );

  return response.data;
}