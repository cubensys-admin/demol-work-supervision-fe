import type { DemolitionRequestStatus, DemolitionRequestType } from './types';

export function getDemolitionStatusLabel(status: DemolitionRequestStatus): string {
  const labels: Record<DemolitionRequestStatus, string> = {
    INITIAL_REQUEST: '요청 접수',
    INITIAL_REJECTED: '초기 반려',
    RE_REQUEST: '재요청',
    VERIFICATION_REQUESTED: '검증 요청',
    VERIFICATION_COMPLETED: '검증 완료',
    VERIFICATION_REJECTED: '검증 거절',
    RECOMMENDATION_COMPLETED: '추천 완료',
    SUPERVISOR_ASSIGNED: '감리자 지정',
    SUPERVISOR_COMPLETED: '감리 완료',
    CANCELLED: '취소됨',
  };
  return labels[status] || status;
}

export function getDemolitionStatusBadge(status: DemolitionRequestStatus): string {
  const badges: Record<DemolitionRequestStatus, string> = {
    INITIAL_REQUEST: 'bg-gray-100 text-gray-700',
    INITIAL_REJECTED: 'bg-red-50 text-red-600',
    RE_REQUEST: 'bg-orange-100 text-orange-700',
    VERIFICATION_REQUESTED: 'bg-yellow-100 text-yellow-700',
    VERIFICATION_COMPLETED: 'bg-green-100 text-green-700',
    VERIFICATION_REJECTED: 'bg-red-100 text-red-700',
    RECOMMENDATION_COMPLETED: 'bg-indigo-100 text-indigo-700',
    SUPERVISOR_ASSIGNED: 'bg-purple-100 text-purple-700',
    SUPERVISOR_COMPLETED: 'bg-teal-100 text-teal-700',
    CANCELLED: 'bg-gray-400 text-gray-700',
  };
  return badges[status] || 'bg-gray-100 text-gray-700';
}

export function getDemolitionTypeLabel(type: DemolitionRequestType): string {
  const labels: Record<DemolitionRequestType, string> = {
    RECOMMENDATION: '추천',
    PRIORITY_DESIGNATION: '우선지정',
  };
  return labels[type] || type;
}

export function getDemolitionTypeBadge(type: DemolitionRequestType): string {
  const badges: Record<DemolitionRequestType, string> = {
    RECOMMENDATION: 'bg-blue-50 text-blue-600',
    PRIORITY_DESIGNATION: 'bg-orange-50 text-orange-600',
  };
  return badges[type] || 'bg-gray-50 text-gray-600';
}

// 감리자 전용 상태 라벨 (SUPERVISOR_ASSIGNED를 '감리 중'으로 표시)
export function getInspectorDemolitionStatusLabel(status: DemolitionRequestStatus): string {
  if (status === 'SUPERVISOR_ASSIGNED') {
    return '감리 중';
  }
  return getDemolitionStatusLabel(status);
}

// 구청 전용 상태 라벨 (진행 상태를 단순화하여 표시)
export function getDistrictDemolitionStatusLabel(status: DemolitionRequestStatus): string {
  // 검증요청 단계들
  if (
    status === 'INITIAL_REQUEST' ||
    status === 'RE_REQUEST' ||
    status === 'VERIFICATION_REQUESTED' ||
    status === 'VERIFICATION_COMPLETED' ||
    status === 'VERIFICATION_REJECTED'
  ) {
    return '검증요청';
  }

  // 감리자 지정
  if (status === 'SUPERVISOR_ASSIGNED' || status === 'RECOMMENDATION_COMPLETED') {
    return '감리자 지정';
  }

  // 감리 완료
  if (status === 'SUPERVISOR_COMPLETED') {
    return '감리 완료';
  }

  // 취소됨
  if (status === 'CANCELLED') {
    return '취소됨';
  }

  // INITIAL_REJECTED는 별도 처리 (필요시)
  if (status === 'INITIAL_REJECTED') {
    return '검증요청';
  }

  return status;
}

// 구청 전용 상태 배지
export function getDistrictDemolitionStatusBadge(status: DemolitionRequestStatus): string {
  // 검증요청 단계들
  if (
    status === 'INITIAL_REQUEST' ||
    status === 'INITIAL_REJECTED' ||
    status === 'RE_REQUEST' ||
    status === 'VERIFICATION_REQUESTED' ||
    status === 'VERIFICATION_COMPLETED' ||
    status === 'VERIFICATION_REJECTED'
  ) {
    return 'bg-yellow-100 text-yellow-700';
  }

  // 감리자 지정
  if (status === 'SUPERVISOR_ASSIGNED' || status === 'RECOMMENDATION_COMPLETED') {
    return 'bg-purple-100 text-purple-700';
  }

  // 감리 완료
  if (status === 'SUPERVISOR_COMPLETED') {
    return 'bg-teal-100 text-teal-700';
  }

  // 취소됨
  if (status === 'CANCELLED') {
    return 'bg-gray-400 text-gray-700';
  }

  return 'bg-gray-100 text-gray-700';
}
