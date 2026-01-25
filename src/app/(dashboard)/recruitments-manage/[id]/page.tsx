import type { Metadata } from "next";
import { use } from "react";
import { RecruitmentDetailCard } from "@/features/recruitment/detail/ui/RecruitmentDetailCard";

export const metadata: Metadata = {
  title: "모집공고 상세",
  description: "모집공고 상세 정보",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RecruitmentDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
      <RecruitmentDetailCard id={Number(id)} isManageMode={true} />
    </div>
  );
}