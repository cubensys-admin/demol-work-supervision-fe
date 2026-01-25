import type { Metadata } from "next";
import { use } from "react";
import { NoticeForm } from "@/features/notice/manage/ui/NoticeForm";

export const metadata: Metadata = {
  title: "공지사항 수정",
  description: "공지사항 수정",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NoticeEditPage({ params }: PageProps) {
  const { id } = use(params);
  return <NoticeForm mode="edit" id={Number(id)} />;
}