"use client";

import { NoticeListCard } from "@/features/notice/list/ui/NoticeListCard";

/**
 * Public notice list page - accessible without authentication
 */
export default function PublicNoticesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
      <NoticeListCard isManageMode={false} />
    </div>
  );
}
