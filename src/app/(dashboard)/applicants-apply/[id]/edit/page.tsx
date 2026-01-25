import type { Metadata } from 'next';
import { use } from 'react';

import { ResubmitForm } from '@/features/applicant/apply/ui/ResubmitForm';

export const metadata: Metadata = {
  title: '감리자 신청 수정',
  description: '감리자가 접수 대기 중인 신청서를 수정하는 페이지',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InspectorApplicationEditPage({ params }: PageProps) {
  const { id } = use(params);
  const applicationId = Number(id);
  return <ResubmitForm applicationId={applicationId} mode="edit" />;
}
