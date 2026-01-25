'use client';

import { deleteResource } from '@/features/resource/manage/api/deleteResource';
import { ResourceDetailCard } from '@/features/resource/detail/ui/ResourceDetailCard';

interface ResourceDetailProps {
  id: number;
}

export function ResourceDetail({ id }: ResourceDetailProps) {
  const handleDelete = async (id: number) => {
    await deleteResource(id);
  };

  return <ResourceDetailCard id={id} isManageMode={true} onDelete={handleDelete} />;
}
