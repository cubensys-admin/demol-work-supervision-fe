"use client";

import { useParams } from "next/navigation";
import { RecruitmentDetailCard } from "@/features/recruitment/detail/ui/RecruitmentDetailCard";

/**
 * Public recruitment detail page - accessible without authentication
 */
export default function PublicRecruitmentDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
      <RecruitmentDetailCard id={id} isManageMode={false} />
    </div>
  );
}
