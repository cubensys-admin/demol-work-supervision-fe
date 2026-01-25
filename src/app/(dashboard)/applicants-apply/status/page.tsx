import type { Metadata } from 'next';

import { InspectorApplicationStatus } from '@/features/applicant/apply/ui/InspectorApplicationStatus';

export const metadata: Metadata = {
  title: '감리자 지원 현황',
  description: '감리자가 제출한 신청의 처리 상태를 확인하는 페이지',
};

export default function InspectorApplicationStatusPage() {
  return <InspectorApplicationStatus />;
}
