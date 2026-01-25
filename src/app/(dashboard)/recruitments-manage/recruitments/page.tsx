import type { Metadata } from "next";

import { RecruitmentList } from "@/widgets/recruitment-list/ui/RecruitmentList";

export const metadata: Metadata = {
  title: "모집공고",
  description:
    "서울특별시 해체공사감리자 모집공고를 확인하고 지원 일정을 확인하세요.",
};

export default function RecruitmentsPage() {
  return <RecruitmentList />;
}