import type { Metadata } from 'next';

import { InspectorApplicationForm } from '@/features/applicant/apply/ui/InspectorApplicationForm';

export const metadata: Metadata = {
  title: '감리자 등재 신청',
  description: '감리자가 모집공고에 지원하기 위한 신청서 작성 페이지',
};

export default function InspectorApplicationFormPage() {
  return <InspectorApplicationForm />;
}
