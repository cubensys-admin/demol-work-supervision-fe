import type { Metadata } from 'next';

import { ResubmitForm } from '@/features/applicant/apply/ui/ResubmitForm';

export const metadata: Metadata = {
  title: '지원서 재제출',
  description: '반려된 지원서를 수정하여 재제출합니다.',
};

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResubmitPage({ params }: PageParams) {
  const { id } = await params;
  const applicationId = parseInt(id, 10);

  if (isNaN(applicationId)) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-red-600 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        잘못된 지원서 ID입니다.
      </div>
    );
  }

  return <ResubmitForm applicationId={applicationId} />;
}