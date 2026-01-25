import { HERO_STATS } from "@/shared/model/mainPageContent";
import { Container } from "@/shared/ui/container";

export function Hero() {
  return (
    <section className="relative h-[520px] w-full overflow-hidden bg-[url('/assets/landing/main_hero.jpg')] bg-cover bg-right bg-no-repeat">
      <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.1)_100%)]" />

      <Container className="relative flex h-full flex-col justify-center">
        <div className="ml-5 max-w-[558px] space-y-2 text-left">
          <p className="whitespace-nowrap text-[20px] leading-[28px] text-subtle">
            Construction Demolition Management System
          </p>
          <h1 className="whitespace-nowrap text-[40px] font-semibold leading-[56px] tracking-[-1px] text-heading">
            건축물 해체 공사 감리 시스템
          </h1>
          <p className="max-w-[600px] text-[20px] leading-[28px] text-muted">
            해체 허가를 받은 건축물의 해체공사를 진행할 때 허가권자는
            등록되어 있고 교육받은 자가 해체공사 감리로 지정받아 업무를
            수행합니다.
          </p>
        </div>

        <div className="absolute bottom-14 right-6 flex flex-wrap justify-end gap-2">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative h-[175px] w-[202px] rounded-[20px] bg-white/80 px-5 pb-8 pt-8 shadow-[2px_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-[5px]"
            >
              <p className="text-center text-[20px] font-semibold text-heading">
                {stat.label}
              </p>
              <div
                className="absolute bottom-6 left-0 h-16 w-full px-6"
                style={{
                  backgroundImage: `url(${stat.background})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "24px bottom",
                  backgroundSize: "36px 36px",
                }}
              >
                <span className="absolute right-6 top-0 text-[56px] font-bold leading-[1.5] text-primary">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
