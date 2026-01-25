import type { Metadata } from "next";
import { NoticeList } from "@/features/notice/manage/ui/NoticeList";

export const metadata: Metadata = {
  title: "공지사항 관리",
  description: "공지사항 관리",
};

export default function NoticesManagePage() {
  return <NoticeList />;
}