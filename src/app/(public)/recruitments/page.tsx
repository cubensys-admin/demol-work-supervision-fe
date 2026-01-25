"use client";

import { RecruitmentListCard } from "@/features/recruitment/list/ui/RecruitmentListCard";

/**
 * Public recruitment list page - accessible without authentication
 */
export default function PublicRecruitmentsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
      <RecruitmentListCard isManageMode={false} />
    </div>
  );
}
