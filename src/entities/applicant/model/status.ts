import type { ApplicantStatus } from './types';

export function getApplicantStatusLabel(status: ApplicantStatus): string {
  const labels: Record<ApplicantStatus, string> = {
    DRAFT: '임시저장',
    PENDING: '접수완료',
    REVIEWING: '검토중',
    APPROVED: '승인됨',
    REJECTED: '거절됨',
    RETURNED: '반려됨',
    RESUBMITTED: '재제출됨',
    WITHDRAWN: '취소함',
  };
  return labels[status] || status;
}

export function getApplicantStatusBadge(status: ApplicantStatus): string {
  const badges: Record<ApplicantStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING: 'bg-gray-100 text-gray-700',
    REVIEWING: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    RETURNED: 'bg-yellow-100 text-yellow-700',
    RESUBMITTED: 'bg-indigo-100 text-indigo-700',
    WITHDRAWN: 'bg-gray-400 text-gray-700',
  };
  return badges[status] || 'bg-gray-100 text-gray-700';
}
