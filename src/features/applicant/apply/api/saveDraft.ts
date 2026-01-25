import { httpClient } from '@/shared/api/httpClient';
import type { ApplicantDetail } from '@/entities/applicant/model/types';

export interface ApplicantDraftRequest {
  periodNumber: number;
  zone?: string;
  applicantName?: string;
  specialty?: string;
  remark?: string;
  gender?: 'MALE' | 'FEMALE';
  seumterId?: string;
  educationCompletionNumber?: string;
  officeAddress?: string;
  businessType?: 'GENERAL' | 'CORPORATION';
  registrationNumber?: string;
  engineeringServiceNumber1?: string;
  engineeringServiceNumber2?: string;
  engineeringServiceNumber3?: string;
  engineeringServiceRegisteredAt?: string;
  appliedScales?: string[];
  personnel?: Array<{
    name: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE';
    qualification: string;
  }>;
  zoneChangeRequest?: {
    zone?: string;
    description?: string;
  };
}

/**
 * 지원서 임시저장 생성
 */
export async function createDraft(data: ApplicantDraftRequest): Promise<ApplicantDetail> {
  const response = await httpClient.post<ApplicantDetail>('/api/applicants/drafts', data);
  return response.data;
}

/**
 * 임시저장 수정
 */
export async function updateDraft(id: number, data: ApplicantDraftRequest): Promise<ApplicantDetail> {
  const response = await httpClient.put<ApplicantDetail>(`/api/applicants/drafts/${id}`, data);
  return response.data;
}

/**
 * 임시저장 상세 조회
 */
export async function getDraft(id: number): Promise<ApplicantDetail> {
  const response = await httpClient.get<ApplicantDetail>(`/api/applicants/drafts/${id}`);
  return response.data;
}

/**
 * 특정 기수 임시저장 존재 여부 확인
 */
export async function checkDraftExists(periodNumber: number): Promise<boolean> {
  const response = await httpClient.get<{ exists: boolean }>(
    `/api/applicants/drafts/period/${periodNumber}/exists`
  );
  return response.data.exists;
}

/**
 * 특정 기수의 임시저장 조회 (내 지원서 목록에서 DRAFT 상태인 것 찾기)
 */
export async function getDraftByPeriod(periodNumber: number): Promise<ApplicantDetail | null> {
  const response = await httpClient.get<ApplicantDetail[]>('/api/applicants/me');
  const draft = response.data.find(
    (app) => app.periodNumber === periodNumber && app.status === 'DRAFT'
  );
  return draft ?? null;
}

/**
 * 임시저장 제출 (DRAFT -> PENDING)
 */
export async function submitDraft(id: number, formData: FormData): Promise<ApplicantDetail> {
  const response = await httpClient.post<ApplicantDetail>(
    `/api/applicants/drafts/${id}/submit`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}
