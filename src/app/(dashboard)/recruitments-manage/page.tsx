import type { Metadata } from "next";
import { RecruitmentListCard } from "@/features/recruitment/list/ui/RecruitmentListCard";

export const metadata: Metadata = {
  title: "모집공고 관리",
  description: "시청/건축사회 사용자를 위한 모집공고 관리 페이지",
};

export default function RecruitmentManagePage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
      <RecruitmentListCard isManageMode={true} />
    </div>
  );
}