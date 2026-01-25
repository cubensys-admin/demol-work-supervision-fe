'use client';

import { Select } from '@/shared/ui/select';

export default function Footer() {
  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = e.target.value;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      // Reset select to default
      e.target.value = '';
    }
  };

  return (
    <footer className="relative">
      <div
        className="absolute inset-0 -z-10 opacity-10 bg-gray-800"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }}
        aria-hidden="true"
      />
      <div className="max-w-[1600px] mx-auto px-6 py-14">
        <div className="flex justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4" aria-label="정책 링크">
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                개인정보처리방침
              </a>
              <span className="w-px h-3 bg-gray-400"></span>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                이메일무단수집거부
              </a>
            </div>
            <div className="space-y-1">
              <div className="text-base font-semibold text-gray-800">서울특별시청</div>
              <div className="text-sm text-gray-600">서울특별시 중구 세종대로 110</div>
              <div className="text-xs text-gray-500">Copyright © Demolition Work. All rights reserved.</div>
            </div>
          </div>

          <div className="flex items-end">
            <Select onChange={handleSiteChange} defaultValue="">
              <option value="" disabled>자주 방문하는 사이트</option>
              <option value="https://siragamri.com/sira/">허가권자지정감리자</option>
              <option value="https://sira.or.kr/">서울특별시건축사회</option>
              <option value="https://supervision.sira.or.kr/coast_1.php">건축물설계및감리</option>
              <option value="https://supervision.sira.or.kr/coast_2.php">허가권자지정감리</option>
              <option value="https://supervision.sira.or.kr/coast_6.php">실비정액가산식</option>
              <option value="https://supervision.sira.or.kr/coast_3.php">설계의도구현</option>
              <option value="https://supervision.sira.or.kr/coast_7.php">건축물관리점검</option>
              <option value="https://www.kira.or.kr/index.do">대한건축사협회</option>
              <option value="https://kiraeb.kira.or.kr/main.do">건축사교육원</option>
              <option value="https://kirakarb.kira.or.kr/mainPage.do">건축사등록원</option>
              <option value="https://www.cafco.kr/">건축사공제조합</option>
              <option value="http://seoulcu.co.kr/index.html">서울건축사신협</option>
            </Select>
          </div>
        </div>
      </div>
    </footer>
  )
}
