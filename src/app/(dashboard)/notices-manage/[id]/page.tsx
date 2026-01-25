import type { Metadata } from "next";
import { use } from "react";
import { NoticeDetail } from "@/features/notice/manage/ui/NoticeDetail";

export const metadata: Metadata = {
  title: "공지사항 상세",
  description: "공지사항 상세",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NoticeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <NoticeDetail id={Number(id)} />;
}