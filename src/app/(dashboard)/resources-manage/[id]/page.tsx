import type { Metadata } from "next";
import { use } from "react";
import { ResourceDetail } from "@/features/resource/manage/ui/ResourceDetail";

export const metadata: Metadata = {
  title: "자료실 상세",
  description: "자료실 게시글 상세 정보",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResourceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <ResourceDetail id={Number(id)} />;
}