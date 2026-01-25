'use client';

import { deleteNotice } from '@/features/notice/manage/api/deleteNotice';
import { NoticeDetailCard } from '@/features/notice/detail/ui/NoticeDetailCard';

interface NoticeDetailProps {
  id: number;
}

export function NoticeDetail({ id }: NoticeDetailProps) {
  const handleDelete = async (id: number) => {
    await deleteNotice(id);
  };

  return <NoticeDetailCard id={id} isManageMode={true} onDelete={handleDelete} />;
}
