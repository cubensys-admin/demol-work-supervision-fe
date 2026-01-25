"use client";

import { useParams } from "next/navigation";
import { ResourceDetailCard } from "@/features/resource/detail/ui/ResourceDetailCard";

/**
 * Public archive (resource) detail page - accessible without authentication
 */
export default function PublicArchiveDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
      <ResourceDetailCard id={id} isManageMode={false} />
    </div>
  );
}
