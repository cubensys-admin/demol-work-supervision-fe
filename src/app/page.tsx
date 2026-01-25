import { Hero } from "@/widgets/hero/Hero";
import { RecruitmentHighlights } from "@/widgets/recruitment-highlights/ui/RecruitmentHighlights";
import { ServiceOverview } from "@/widgets/service-overview/ServiceOverview";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />
      <main>
        <Hero />
        <ServiceOverview />
        <RecruitmentHighlights />
      </main>
      <SiteFooter />
    </div>
  );
}
