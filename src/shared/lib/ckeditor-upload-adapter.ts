import { httpClient } from '@/shared/api/httpClient';
import { env } from '@/shared/config/env';

export class UploadAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private loader: any;
  private uploadUrl: string;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(loader: any, uploadUrl: string) {
    this.loader = loader;
    this.uploadUrl = uploadUrl;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;
    
    const formData = new FormData();
    formData.append('upload', file);

    try {
      const response = await httpClient.post<{
        uploaded: number;
        fileName: string;
        url: string;
      }>(this.uploadUrl, formData);

      // Convert relative URL to absolute URL
      const fullUrl = response.data.url.startsWith('http') 
        ? response.data.url 
        : `${env.apiBaseUrl}${response.data.url}`;

      // Return the URL in the format CKEditor expects
      return {
        default: fullUrl,
      };
    } catch {
      throw new Error('Failed to upload image');
    }
  }

  abort(): void {
    // Handle abort if needed
  }
}

export function createUploadAdapterPlugin(uploadUrl: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function UploadAdapterPlugin(editor: any): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return new UploadAdapter(loader, uploadUrl);
    };
  };
}