'use client';

import { deleteNotice } from '@/features/notice/manage/api/deleteNotice';
import { NoticeListCard } from '@/features/notice/list/ui/NoticeListCard';

export function NoticeList() {
  const handleDelete = async (id: number) => {
    await deleteNotice(id);
  };

  return <NoticeListCard isManageMode={true} onDelete={handleDelete} />;
}
