import type { UserRole } from '@/shared/model/authStore'

export interface MenuItem {
  label: string
  path: string
  subItems?: {
    label: string
    path: string
  }[]
}

// 건축사회 메뉴 구조
const architectSocietyMenuItems: MenuItem[] = [
  {
    label: '소개',
    path: '/about',
    subItems: [
      { label: '해체공사감리업무', path: '/about' },
    ],
  },
  {
    label: '업무알림',
    path: '/work-notifications',
  },
  {
    label: '등재 신청/조회',
    path: '/recruitments-manage',
    subItems: [
      { label: '공고 조회/등록', path: '/recruitments-manage' },
      { label: '신청내역 조회', path: '/applicants-manage' },
      { label: '정보변경 관리', path: '/applicant-info-change' },
    ],
  },
  {
    label: '해체공사감리 관리',
    path: '/architect/demolition/status',
    subItems: [
      { label: '감리자 추천', path: '/architect/demolition/verification' },
      { label: '해체공사감리 현황', path: '/architect/demolition/recommendation' },
      { label: '공사감리자 조회', path: '/architect/demolition/status' },
    ],
  },
  {
    label: '유용한 정보',
    path: '/notices-manage',
    subItems: [
      { label: '공지사항', path: '/notices-manage' },
      { label: '서식 및 자료실', path: '/resources-manage' },
    ],
  },
  {
    label: '서비스 관리',
    path: '/board-management',
    subItems: [
      { label: '게시판 관리', path: '/board-management' },
      { label: '팝업 관리', path: '/popup-management' },
      { label: '실적회비 관리', path: '/fee-management' },
      { label: '발송관리', path: '/message-management' },
    ],
  },
  {
    label: '마이페이지',
    path: '/my-info',
    subItems: [
      { label: '내 정보', path: '/my-info' },
      { label: '기타정보 변경', path: '/other-info-change' },
    ],
  },
]

// 시청 메뉴 구조
const cityHallMenuItems: MenuItem[] = [
  {
    label: '소개',
    path: '/about',
    subItems: [
      { label: '해체공사감리업무', path: '/about' },
    ],
  },
  {
    label: '업무알림',
    path: '/work-notifications',
  },
  {
    label: '등재 신청/조회',
    path: '/recruitments-manage',
    subItems: [
      { label: '공고 조회/등록', path: '/recruitments-manage' },
      { label: '신청내역 조회', path: '/applicants-manage' },
    ],
  },
  {
    label: '해체공사감리 관리',
    path: '/city/demolition/status',
    subItems: [
      { label: '감리자 추천', path: '/city/demolition/verification' },
      { label: '해체공사감리 현황', path: '/city/demolition/recommendation' },
      { label: '공사감리자 조회', path: '/city/demolition/status' },
    ],
  },
  {
    label: '유용한 정보',
    path: '/notices-manage',
    subItems: [
      { label: '공지사항', path: '/notices-manage' },
      { label: '서식 및 자료실', path: '/resources-manage' },
    ],
  },
  {
    label: '서비스 관리',
    path: '/board-management',
    subItems: [
      { label: '게시판 관리', path: '/board-management' },
    ],
  },
  {
    label: '마이페이지',
    path: '/my-info',
    subItems: [
      { label: '내 정보', path: '/my-info' },
      { label: '기타정보 변경', path: '/other-info-change' },
    ],
  },
]

// 구청 메뉴 구조
const districtOfficeMenuItems: MenuItem[] = [
  {
    label: '소개',
    path: '/about',
    subItems: [
      { label: '해체공사감리업무', path: '/about' },
    ],
  },
  {
    label: '업무알림',
    path: '/work-notifications',
  },
  {
    label: '해체공사감리 관리',
    path: '/district/demolition/request',
    subItems: [
      { label: '감리자 의뢰', path: '/district/demolition/request' },
      { label: '감리자 의뢰내역', path: '/district/demolition/status' },
    ],
  },
  {
    label: '유용한 정보',
    path: '/notices-manage',
    subItems: [
      { label: '공지사항', path: '/notices-manage' },
      { label: '서식 및 자료실', path: '/resources-manage' },
    ],
  },
  {
    label: '마이페이지',
    path: '/my-info',
    subItems: [
      { label: '내 정보', path: '/my-info' },
      { label: '기타정보 변경', path: '/other-info-change' },
    ],
  },
]

// 감리자 메뉴 구조
const inspectorMenuItems: MenuItem[] = [
  {
    label: '소개',
    path: '/about',
    subItems: [
      { label: '해체공사감리업무', path: '/about' },
    ],
  },
  {
    label: '등재 신청/조회',
    path: '/applicants-apply/apply',
    subItems: [
      { label: '등재 신청', path: '/applicants-apply/apply' },
      { label: '신청내역 조회', path: '/applicants-apply/status' },
    ],
  },
  {
    label: '해체공사감리 관리',
    path: '/demolition/inspector-work',
    subItems: [
      { label: '감리수행 정보', path: '/demolition/inspector-work' },
    ],
  },
  {
    label: '유용한 정보',
    path: '/notices',
    subItems: [
      { label: '공지사항', path: '/notices-manage' },
      { label: '서식 및 자료실', path: '/resources-manage' },
    ],
  },
  {
    label: '마이페이지',
    path: '/my-info',
    subItems: [
      { label: '내 정보', path: '/my-info' },
      { label: '기타정보 변경', path: '/other-info-change' },
    ],
  },
]

export const menuByRole: Record<UserRole, MenuItem[]> = {
  ARCHITECT_SOCIETY: architectSocietyMenuItems,
  CITY_HALL: cityHallMenuItems,
  DISTRICT_OFFICE: districtOfficeMenuItems,
  INSPECTOR: inspectorMenuItems,
}

// 비로그인 사용자 메뉴
export const defaultMenu: MenuItem[] = [
  {
    label: '소개',
    path: '/about',
    subItems: [
      { label: '해체공사감리업무', path: '/about' },
    ],
  },
  {
    label: '등재 신청/조회',
    path: '/registration',
  },
  {
    label: '해체공사감리',
    path: '/demolition-management',
  },
  {
    label: '유용한 정보',
    path: '/notices',
    subItems: [
      { label: '공지사항', path: '/notices' },
      { label: '서식 및 자료실', path: '/archives' },
    ],
  },
]

export const publicMenu: MenuItem[] = [
  {
    label: '소개',
    path: '/about',
    subItems: [
      { label: '해체공사감리업무', path: '/about' },
    ],
  },
  {
    label: '유용한 정보',
    path: '/notices',
    subItems: [
      { label: '공지사항', path: '/notices' },
      { label: '서식 및 자료실', path: '/archives' },
    ],
  },
]

const roleLabelMap: Record<UserRole, string> = {
  CITY_HALL: '시청 관리자',
  ARCHITECT_SOCIETY: '건축사회 관리자',
  DISTRICT_OFFICE: '구청 담당자',
  INSPECTOR: '해체공사감리자',
}

export const getRoleLabel = (role: UserRole | null) => {
  if (!role) return null
  return roleLabelMap[role]
}
