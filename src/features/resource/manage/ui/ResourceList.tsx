'use client';

import { deleteResource } from '@/features/resource/manage/api/deleteResource';
import { ResourceListCard } from '@/features/resource/list/ui/ResourceListCard';

export function ResourceList() {
  const handleDelete = async (id: number) => {
    await deleteResource(id);
  };

  return <ResourceListCard isManageMode={true} onDelete={handleDelete} />;
}
