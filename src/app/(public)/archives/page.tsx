"use client";

import { ResourceListCard } from "@/features/resource/list/ui/ResourceListCard";

/**
 * Public archive (resources) list page - accessible without authentication
 */
export default function PublicArchivesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
      <ResourceListCard isManageMode={false} />
    </div>
  );
}
