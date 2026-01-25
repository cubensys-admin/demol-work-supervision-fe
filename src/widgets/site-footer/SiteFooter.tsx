import Link from "next/link";

import { FOOTER_LINKS } from "@/shared/model/mainPageContent";
import { Container } from "@/shared/ui/container";
import { Select } from "@/shared/ui/select";

export function SiteFooter() {
  const { policies, organization } = FOOTER_LINKS;

  return (
    <footer className="border-t border-border-neutral bg-white">
      <Container className="flex flex-col justify-between gap-[52px] py-6 lg:flex-row">
        <div className="flex flex-col gap-[52px] text-sm text-secondary">
          <div className="flex items-center gap-2">
            {policies.map((policy, index) => (
              <div key={policy.label} className="flex items-center gap-2">
                <Link href={policy.href} className="whitespace-nowrap text-secondary">
                  {policy.label}
                </Link>
                {index < policies.length - 1 && (
                  <span className="h-3 w-px bg-border-divider" aria-hidden />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-heading">
              {organization.name}
            </span>
            <span className="text-secondary">{organization.address}</span>
            <span className="text-[12px] leading-[16.8px] text-caption">
              {organization.copyright}
            </span>
          </div>
        </div>

        <div className="w-full max-w-[240px]">
          <label htmlFor="favorite-site" className="sr-only">
            자주 방문하는 사이트 선택
          </label>
          <Select
            id="favorite-site"
            defaultValue=""
          >
            <option value="" disabled>
              자주 방문하는 사이트
            </option>
          </Select>
        </div>
      </Container>
    </footer>
  );
}
