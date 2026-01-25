import type { Metadata } from "next";
import { NoticeForm } from "@/features/notice/manage/ui/NoticeForm";

export const metadata: Metadata = {
  title: "공지사항 등록",
  description: "공지사항 등록",
};

export default function NoticeCreatePage() {
  return <NoticeForm mode="create" />;
}