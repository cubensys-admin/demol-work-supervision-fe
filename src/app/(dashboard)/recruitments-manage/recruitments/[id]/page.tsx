import type { Metadata } from 'next';

import { getRecruitmentById } from '@/entities/recruitment/api/getRecruitmentById';
import { RecruitmentDetailView } from '@/widgets/recruitment-detail/ui/RecruitmentDetailView';

export const metadata: Metadata = {
  title: '모집공고 상세',
  description: '서울특별시 해체공사감리자 모집공고 상세 정보입니다.',
};

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecruitmentDetailPage({ params }: PageParams) {
  const { id } = await params;
  const recruitmentId = parseInt(id, 10);

  if (isNaN(recruitmentId)) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-red-600 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        잘못된 모집공고 ID입니다.
      </div>
    );
  }

  let recruitment;
  try {
    recruitment = await getRecruitmentById(recruitmentId);
  } catch (error) {
    console.error(error);
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        모집공고를 찾을 수 없습니다.
      </div>
    );
  }

  return <RecruitmentDetailView recruitment={recruitment} />;
}