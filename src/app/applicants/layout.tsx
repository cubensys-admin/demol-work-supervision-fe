import type { Metadata } from "next";

import { SiteHeader } from "@/widgets/site-header/SiteHeader";

export const metadata: Metadata = {
  title: "지원 관리",
};

export default function ApplicantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />
      <main className="pt-[120px]">{children}</main>
    </div>
  );
}
