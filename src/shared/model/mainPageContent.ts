import type { CSSProperties } from "react";

export const MAIN_NAV_LINKS = [
  { label: "등재 신청/조회", href: "/applicants/apply" },
  { label: "해체공사감리내역 조회", href: "#" },
  { label: "기타정보 변경/조회", href: "#" },
];

export const HERO_STATS = [
  {
    label: "감리자정보 변경요청",
    value: "3",
    background: "/assets/landing/file_edit.png",
  },
  {
    label: "감리자 추천 요청",
    value: "12",
    background: "/assets/landing/user_add.png",
  },
  {
    label: "감리자 재추천 요청",
    value: "7",
    background: "/assets/landing/wavy_check.png",
  },
  {
    label: "감리자 취하 요청",
    value: "9",
    background: "/assets/landing/user_check.png",
  },
];

export const SERVICE_OVERVIEW_CARDS = [
  {
    title: "해체감리자 안내",
    description:
      "해체감리자는 건축물 해체 공사의 시작부터 완료까지, 공사 전반의 안전과 적법성을 확인하고 감독하는 역할을 맡습니다.",
    background: {
      backgroundColor: "#E3F4FF",
      backgroundImage: "url('/assets/landing/l-building.png')",
      backgroundPosition: "calc(100% - 20px) calc(100% - 20px)",
      backgroundRepeat: "no-repeat",
    } satisfies CSSProperties,
  },
  {
    title: "신규신청 안내",
    description:
      "교육을 이수한 후, 서울시건축사회에서 운영하는 시스템을 통해 해체감리자 명부에 등재 신청을 합니다.",
    background: {
      backgroundColor: "#DFEDFF",
      backgroundImage: "url('/assets/landing/f-clipboard.png')",
      backgroundPosition: "calc(100% - 20px) calc(100% - 20px)",
      backgroundRepeat: "no-repeat",
    } satisfies CSSProperties,
  },
  {
    title: "승인감리자 안내",
    description:
      "해체감리자는 감리자가 속한 구와 서울시청의 관리감독을 받습니다. 감리 승인을 위한 페이지입니다.",
    background: {
      backgroundColor: "#E4E8FF",
      backgroundImage: "url('/assets/landing/f-verified-check.png')",
      backgroundPosition: "calc(100% - 20px) calc(100% - 20px)",
      backgroundRepeat: "no-repeat",
    } satisfies CSSProperties,
  },
  {
    title: "변경요청관리 안내",
    description:
      "해체감리자의 사정으로 변경이 필요할 경우, 로그인 후 요청사항을 등록/수정하실 수 있습니다.",
    background: {
      backgroundColor: "#D7E5FF",
      backgroundImage: "url('/assets/landing/f-edit.png')",
      backgroundPosition: "calc(100% - 20px) calc(100% - 20px)",
      backgroundRepeat: "no-repeat",
    } satisfies CSSProperties,
  },
];

const panelItems = [
  "2023년 제 4기 해체공사감리자 명부 2023년 제 4기 해체공사감리자 명부 2023년 제 4기 해체공사감..",
  "2023년 제 4기 해체공사감리자 명부 2023년 제 4기 해체공사감리자 명부 2023년 제 4기 해체공사감..",
  "2023년 제 4기 해체공사감리자 명부 2023년 제 4기 해체공사감리자 명부 2023년 제 4기 해체공사감..",
  "2023년 제 4기 해체공사감리자 명부 2023년 제 4기 해체공사감리자 명부 2023년 제 4기 해체공사감..",
];

export const INFO_PANELS = [
  {
    title: "법령정보",
    items: panelItems,
    date: "2025. 8. 11",
  },
  {
    title: "공지사항",
    items: panelItems,
    date: "2025. 8. 11",
  },
];

export const FOOTER_LINKS = {
  policies: [
    { label: "개인정보처리방침", href: "#" },
    { label: "이메일무단수집거부", href: "#" },
  ],
  organization: {
    name: "서울특별시청",
    address: "서울특별시 중구 세종대로 110",
    copyright: "Copyright © Demolition Work. All rights reserved.",
  },
};
