"use client";

import { useParams } from "next/navigation";
import { NoticeDetailCard } from "@/features/notice/detail/ui/NoticeDetailCard";

/**
 * Public notice detail page - accessible without authentication
 */
export default function PublicNoticeDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
      <NoticeDetailCard id={id} isManageMode={false} />
    </div>
  );
}
