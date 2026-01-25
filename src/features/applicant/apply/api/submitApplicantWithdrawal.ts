import { httpClient } from '@/shared/api/httpClient';

export async function submitApplicantWithdrawal(id: number, file: File) {
  const formData = new FormData();
  formData.append('withdrawalDocument', file);
  await httpClient.delete(`/api/applicants/${id}`, {
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  } as {
    data: FormData;
    headers: Record<string, string>;
  });
}
