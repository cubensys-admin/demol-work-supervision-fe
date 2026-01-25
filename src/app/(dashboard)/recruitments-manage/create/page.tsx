import type { Metadata } from "next";
import { RecruitmentForm } from "@/features/recruitment/manage/ui/RecruitmentForm";

export const metadata: Metadata = {
  title: "모집공고 작성",
  description: "새로운 모집공고 작성",
};

export default function RecruitmentCreatePage() {
  return <RecruitmentForm mode="create" />;
}