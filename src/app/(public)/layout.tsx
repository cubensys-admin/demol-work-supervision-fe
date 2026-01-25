import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { PublicSidebar } from "@/components/layout/PublicSidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { publicMenu } from "@/components/layout/menuConfig";

/**
 * Public pages layout - no authentication required
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      <div className="pt-[120px]">
        <div
          className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-none"
          style={{
            backgroundImage: 'url("http://115.68.223.95:3000/assets/landing/image%201.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          role="img"
          aria-label="해체공사감리 서비스 소개"
        >
          <p
            className="px-4 text-center text-white"
            style={{
              fontSize: '30px',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '-0.75px',
            }}
          >
            더 안전하고 투명한 서울을 위한 해체공사감리업무 관리시스템
          </p>
        </div>

        <Breadcrumb menuItems={publicMenu} />

        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 pb-12 lg:flex-row">
          <PublicSidebar className="lg:sticky lg:top-[140px]" />
          <main className="flex-1 min-w-0 min-h-[600px]">{children}</main>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
