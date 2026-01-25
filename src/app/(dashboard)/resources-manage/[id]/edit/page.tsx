import type { Metadata } from "next";
import { use } from "react";
import { ResourceForm } from "@/features/resource/manage/ui/ResourceForm";

export const metadata: Metadata = {
  title: "자료 수정",
  description: "자료 수정",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResourceEditPage({ params }: PageProps) {
  const { id } = use(params);
  return <ResourceForm mode="edit" id={Number(id)} />;
}