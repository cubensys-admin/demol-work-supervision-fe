import type { Metadata } from "next";
import { use } from "react";
import { RecruitmentForm } from "@/features/recruitment/manage/ui/RecruitmentForm";

export const metadata: Metadata = {
  title: "모집공고 수정",
  description: "모집공고 수정",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RecruitmentEditPage({ params }: PageProps) {
  const { id } = use(params);
  return <RecruitmentForm mode="edit" id={Number(id)} />;
}