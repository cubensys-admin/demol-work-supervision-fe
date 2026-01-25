import type { Metadata } from "next";
import { ResourceForm } from "@/features/resource/manage/ui/ResourceForm";

export const metadata: Metadata = {
  title: "자료 등록",
  description: "새로운 자료 등록",
};

export default function ResourceCreatePage() {
  return <ResourceForm mode="create" />;
}