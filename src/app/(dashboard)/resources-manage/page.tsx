import type { Metadata } from "next";
import { ResourceList } from "@/features/resource/manage/ui/ResourceList";

export const metadata: Metadata = {
  title: "자료실 관리",
  description: "시청/건축사회 사용자를 위한 자료실 관리 페이지",
};

export default function ResourceManagePage() {
  return <ResourceList />;
}