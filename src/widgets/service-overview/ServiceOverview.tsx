import Link from "next/link";
import { SERVICE_OVERVIEW_CARDS } from "@/shared/model/mainPageContent";
import { Container } from "@/shared/ui/container";
import { SectionLabel } from "@/shared/ui/sectionLabel";

export function ServiceOverview() {
  return (
    <section>
      <Container>
        <SectionLabel>
          서울특별시 건축물 해체공사감리자 주요 서비스 이용 안내
        </SectionLabel>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {SERVICE_OVERVIEW_CARDS.map((card) => {
            const cardContent = (
              <>
                <h2 className="text-[24px] font-semibold leading-[33.6px] text-heading">
                  {card.title}
                </h2>
                <p className="mt-2 text-[16px] leading-[22.4px] text-muted">
                  {card.description}
                </p>
              </>
            );

            const cardClassName =
              "flex h-[382px] flex-col justify-start rounded-[20px] px-7 py-[44px] text-heading shadow-[2px_4px_20px_rgba(0,0,0,0.05)] cursor-pointer transition-transform hover:scale-[1.02]";

            if (card.external) {
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClassName}
                  style={card.background}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link
                key={card.title}
                href={card.href}
                className={cardClassName}
                style={card.background}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
