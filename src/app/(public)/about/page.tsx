import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* 소개 카드 */}
      <div
        className="flex flex-col justify-center gap-5 rounded-[20px] p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.10)]"
        style={{
          background:
            'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(90deg, #FFF 0%, #F2F2F2 74.63%)',
        }}
      >
        <h2
          style={{
            color: '#000',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.6px',
          }}
        >
          소개
        </h2>
        <p
          style={{
            color: '#666',
            fontSize: '16px',
            fontWeight: 400,
            letterSpacing: '-0.4px',
          }}
        >
          해체공사감리시스템에 대한 소개입니다.
        </p>
      </div>

      {/* 해체공사감리제도 카드 */}
      <div
        className="flex flex-col justify-center gap-5 rounded-[20px] p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.10)]"
        style={{
          background:
            'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(90deg, #FFF 0%, #F2F2F2 74.63%)',
        }}
      >
        <div className="text-xl font-bold">해체공사감리제도</div>
        <p className="text-base text-secondary border-b border-border-neutral pb-[30px]">
          「건축물관리법」에 따라 건축물 해체공사의 전 과정에서 안전사고를 예방하고, 공사의 투명성과 적정성을 확보하기 위해 도입한 제도입니다.
        </p>
        {/* 수평선 위아래 간격 30px */}
        <div className="text-xl font-bold mt-[10px]">해체공사 감리자 업무</div>
        <p className="text-base text-secondary">
          「건축물관리법」 제31조 및 32조에 따라, 해체공사감리자는 해체공사 현장에서 감리업무를 수행하고 건축물의 해체작업이 완료되면 해체감리 완료 보고서를 허가권자에게 제출하여야 합니다.
        </p>
      </div>

      {/* 주요업무 카드 */}
      <div className="rounded-[20px] bg-white p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="text-xl font-bold pb-[18px] border-b border-black">주요업무</div>
        {/* 행당 3개씩 */}
        <div className="mt-[18px] grid grid-cols-3 gap-5">
          <div className="flex flex-col gap-5 rounded-[6px] border border-[#E1E8F0] bg-white p-6">
            <div className="flex flex-col gap-5">
              <div className="text-[18px] font-semibold">해체계획서 검토 및 확인</div>
              <ul className="space-y-2 text-secondary">
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  구조안정성, 해체순서, 장비계획, 주변 안전조치 등 검토
                </li>
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  계획서와 실제 시공계획 일치 하는 지 확인
                </li>
              </ul>
            </div>
            <Image src="/assets/landing/Frame 1707481525.svg" alt="해체계획서 검토 및 확인" width={48} height={48} className="mt-auto self-end" />
          </div>
          <div className="flex flex-col gap-5 rounded-[6px] border border-[#E1E8F0] bg-white p-6">
            <div className="flex flex-col gap-5">
              <div className="text-[18px] font-semibold">현장점검 및 안전관리 지도</div>
              <ul className="space-y-2 text-secondary">
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  해체 공정별 위험요소 파악 및 개선 지도
                </li>
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  낙하물 방지시설, 비산먼지·소음 저감조치 확인 가설 구조물 설치 상태 점검
                </li>
              </ul>
            </div>
            <Image src="/assets/landing/Frame 1707481524.svg" alt="현장점검 및 안전관리 지도" width={48} height={48} className="mt-auto self-end" />
          </div>
          <div className="flex flex-col gap-5 rounded-[6px] border border-[#E1E8F0] bg-white p-6">
            <div className="flex flex-col gap-5">
              <div className="text-[18px] font-semibold">공사 중 변경사항 검토</div>
              <ul className="space-y-2 text-secondary">
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  현장 여건 변경 시, 해체계획의 변경 필요 여부 검토
                </li>
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  해체계획서와 다르게 진행되거나 안전에 지장이 있다고 판단되는 경우, 허가권자에게 즉시 보고
                </li>
              </ul>
            </div>
            <Image src="/assets/landing/Frame 1707481526.svg" alt="공사 중 변경사항 검토" width={48} height={48} className="mt-auto self-end" />
          </div>
          <div className="flex flex-col gap-5 rounded-[6px] border border-[#E1E8F0] bg-white p-6">
            <div className="flex flex-col gap-5">
              <div className="text-[18px] font-semibold">보고 및 기록관리</div>
              <ul className="space-y-2 text-secondary">
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  감리일지 작성 및 보고서 제출
                </li>
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  관련 보고서 및 문서 체계적 보관·관리
                </li>
              </ul>
            </div>
            <Image src="/assets/landing/Frame 1707481528.svg" alt="보고 및 기록관리" width={48} height={48} className="mt-auto self-end" />
          </div>
          <div className="flex flex-col gap-5 rounded-[6px] border border-[#E1E8F0] bg-white p-6">
            <div className="flex flex-col gap-5">
              <div className="text-[18px] font-semibold">해체 완료 확인</div>
              <ul className="space-y-2 text-secondary">
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  해체 완료 후 잔재물 처리, 주변 정리상태 등 확인
                </li>
                <li className="relative ml-1.5 pl-3 before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-[#666] before:content-['']">
                  감리완료보고서 작성 및 제출
                </li>
              </ul>
            </div>
            <Image src="/assets/landing/Frame 1707481527.svg" alt="해체 완료 확인" width={48} height={48} className="mt-auto self-end" />
          </div>
        </div>
      </div>
    </div>
  )
}

