import { httpClient } from '@/shared/api/httpClient';
import type {
  DistrictDemolitionRequestCreate,
  DemolitionRequestDetail,
  DemolitionRequestStatus,
  DemolitionRequestType,
  PaginatedDemolitionRequestSummary,
  PaginatedPriorityDesignationApplicant,
  CityInitialRejectRequest,
  VerificationRejectionRequest,
  InspectorCompletionReportRequest,
  InspectorSettlementRequest,
  InspectorCompletionSubmitRequest,
} from '../model/types';

// 구청 해체 요청 API
export async function getDistrictDemolitionRequests(
  params: {
    page?: number;
    size?: number;
    status?: DemolitionRequestStatus | DemolitionRequestStatus[];
    requestType?: DemolitionRequestType;
    region?: string;
    zone?: string;
    periodNumber?: number;
  } = {},
) {
  const response = await httpClient.get<PaginatedDemolitionRequestSummary>(
    '/api/district/demolition-requests',
    {
      params,
    }
  );
  return response.data;
}

// 시청 해체 요청 API
export async function getCityDemolitionRequests(
  params: {
    status?: DemolitionRequestStatus | DemolitionRequestStatus[];
    requestType?: DemolitionRequestType;
    region?: string;
    ownerName?: string;
    supervisorName?: string;
    supervisorLicense?: string;
    siteDetailAddress?: string;
    page?: number;
    size?: number;
  } = {},
) {
  // status 배열을 쉼표로 구분된 문자열로 변환
  const { status, ...rest } = params;
  const queryParams: Record<string, unknown> = { ...rest };
  if (status) {
    queryParams.status = Array.isArray(status) ? status.join(',') : status;
  }

  const response = await httpClient.get<PaginatedDemolitionRequestSummary>(
    '/api/city/demolition-requests',
    {
      params: queryParams,
    }
  );
  return response.data;
}

export async function getArchitectDemolitionRequests(
  params: {
    status?: DemolitionRequestStatus | DemolitionRequestStatus[];
    requestType?: DemolitionRequestType;
    region?: string;
    zone?: string;
    periodNumber?: number;
    requestNumber?: string;
    ownerName?: string;
    siteDetailAddress?: string;
    supervisorName?: string;
    supervisorLicense?: string;
    page?: number;
    size?: number;
  } = {},
) {
  // status 배열을 쉼표로 구분된 문자열로 변환
  const { status, ...rest } = params;
  const queryParams: Record<string, unknown> = { ...rest };
  if (status) {
    queryParams.status = Array.isArray(status) ? status.join(',') : status;
  }

  const response = await httpClient.get<PaginatedDemolitionRequestSummary>(
    '/api/architect/demolition-requests',
    {
      params: queryParams,
    }
  );
  return response.data;
}

export async function getInspectorDemolitionRequests(
  params: {
    status?: DemolitionRequestStatus;
    requestType?: DemolitionRequestType;
    region?: string;
    zone?: string;
    periodNumber?: number;
    ownerName?: string;
    siteAddress?: string;
    fromDate?: string; // YYYY-MM-DD
    toDate?: string;   // YYYY-MM-DD
    page?: number;
    size?: number;
  } = {},
) {
  const response = await httpClient.get<PaginatedDemolitionRequestSummary>(
    '/api/inspector/demolition-requests',
    {
      params,
    }
  );
  return response.data;
}

export async function getCityDemolitionRequestById(id: number) {
  const response = await httpClient.get<DemolitionRequestDetail>(
    `/api/city/demolition-requests/${id}`
  );
  return response.data;
}

export async function getArchitectDemolitionRequestById(id: number) {
  const response = await httpClient.get<DemolitionRequestDetail>(
    `/api/architect/demolition-requests/${id}`
  );
  return response.data;
}

export async function getInspectorDemolitionRequestById(id: number) {
  const response = await httpClient.get<DemolitionRequestDetail>(
    `/api/inspector/demolition-requests/${id}`
  );
  return response.data;
}

export async function createDemolitionRequest(
  payload: DistrictDemolitionRequestCreate
) {
  const response = await httpClient.post<DemolitionRequestDetail>(
    '/api/district/demolition-requests',
    payload
  );
  return response.data;
}

export async function getDemolitionRequestById(id: number) {
  const response = await httpClient.get<DemolitionRequestDetail>(
    `/api/district/demolition-requests/${id}`
  );
  return response.data;
}

export async function updateDemolitionRequest(
  id: number,
  payload: DistrictDemolitionRequestCreate
) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/district/demolition-requests/${id}`,
    payload
  );
  return response.data;
}

export async function assignSupervisor(id: number) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/district/demolition-requests/${id}/assign-supervisor`
  );
  return response.data;
}

export async function cancelDemolitionRequest(id: number) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/district/demolition-requests/${id}/cancel`
  );
  return response.data;
}

export async function searchPriorityDesignationCandidatesByRequestId(
  requestId: number,
  params: { keyword?: string; page?: number; size?: number } = {},
) {
  const response = await httpClient.get<PaginatedPriorityDesignationApplicant>(
    `/api/district/demolition-requests/${requestId}/priority-candidates`,
    {
      params,
    }
  );
  return response.data;
}

export async function searchPriorityDesignationCandidatesByArea(
  params: {
    zone: string;
    scale: string;
    keyword?: string;
    page?: number;
    size?: number;
  },
) {
  const response = await httpClient.get<PaginatedPriorityDesignationApplicant>(
    '/api/district/demolition-requests/priority-candidates',
    {
      params,
    }
  );
  return response.data;
}

export async function preRecommendDemolitionRequest(id: number) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/city/demolition-requests/${id}/pre-recommend`
  );
  return response.data;
}

export async function requestVerificationDemolitionRequest(id: number) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/city/demolition-requests/${id}/request-verification`
  );
  return response.data;
}

export async function rejectInitialDemolitionRequest(
  id: number,
  payload: CityInitialRejectRequest,
) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/city/demolition-requests/${id}/initial-reject`,
    payload,
  );
  return response.data;
}

export async function completeRecommendationDemolitionRequest(id: number) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/city/demolition-requests/${id}/complete-recommendation`
  );
  return response.data;
}

export async function completeVerificationDemolitionRequest(id: number) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/architect/demolition-requests/${id}/complete-verification`
  );
  return response.data;
}

export async function rejectVerificationDemolitionRequest(
  id: number,
  payload: VerificationRejectionRequest,
) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/architect/demolition-requests/${id}/reject-verification`,
    payload,
  );
  return response.data;
}

// 실적회비 정보 입력
export async function submitSettlement(
  id: number,
  payload: InspectorSettlementRequest,
) {
  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/inspector/demolition-requests/${id}/settlement`,
    payload,
  );
  return response.data;
}

// 감리 완료 보고 제출
export async function submitCompletion(
  id: number,
  attachments: File[],
  payload?: InspectorCompletionSubmitRequest,
) {
  const formData = new FormData();
  formData.append(
    'payload',
    new Blob([JSON.stringify(payload || {})], { type: 'application/json' }),
  );
  attachments.forEach((file) => {
    formData.append('attachments', file);
  });

  const response = await httpClient.put<DemolitionRequestDetail>(
    `/api/inspector/demolition-requests/${id}/complete`,
    formData,
  );
  return response.data;
}

// 기존 함수 유지 (하위 호환성)
export async function completeInspectorDemolitionRequest(
  id: number,
  payload: InspectorCompletionReportRequest,
  attachments: File[],
) {
  // 먼저 실적회비 정보 입력
  await submitSettlement(id, payload);
  // 그 다음 감리 완료 제출
  return submitCompletion(id, attachments);
}

// 감리 완료 보고 첨부파일 다운로드
export async function downloadCompletionAttachment(
  requestId: number,
  attachmentId: number,
) {
  const response = await httpClient.get(
    `/api/inspector/demolition-requests/${requestId}/complete/attachments/${attachmentId}`,
    { responseType: 'blob' },
  );
  return response;
}
