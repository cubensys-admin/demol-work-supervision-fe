'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/shared/model/authStore';
import { menuByRole, type MenuItem } from '@/components/layout/menuConfig';

type BreadcrumbItem = {
  label: string;
  path: string;
};

const isPathActive = (pathname: string, targetPath: string) => {
  if (!pathname) return false;
  if (targetPath === '/') {
    return pathname === '/';
  }
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
};

const findBreadcrumbItems = (pathname: string, menuItems: MenuItem[]): BreadcrumbItem[] => {
  // 홈은 항상 첫 번째 아이템
  const breadcrumbs: BreadcrumbItem[] = [{ label: '홈', path: '/' }];

  // 현재 경로와 매칭되는 메뉴 찾기
  for (const item of menuItems) {
    // 서브 메뉴가 있는 경우
    if (item.subItems && item.subItems.length > 0) {
      for (const subItem of item.subItems) {
        if (isPathActive(pathname, subItem.path)) {
          // 1뎁스 추가
          breadcrumbs.push({ label: item.label, path: item.path });
          // 2뎁스 추가
          breadcrumbs.push({ label: subItem.label, path: subItem.path });
          return breadcrumbs;
        }
      }
    } else {
      // 서브 메뉴가 없는 경우 (1뎁스만 있음)
      if (isPathActive(pathname, item.path)) {
        breadcrumbs.push({ label: item.label, path: item.path });
        return breadcrumbs;
      }
    }
  }

  return breadcrumbs;
};

type BreadcrumbProps = {
  menuItems?: MenuItem[];
};

export function Breadcrumb({ menuItems: menuItemsOverride }: BreadcrumbProps = {}) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);

  // 브레드크럼이 표시되지 않아도 공간은 유지
  const emptySpace = <div className="mx-auto max-w-[1600px] px-6 py-4" aria-hidden="true"></div>;

  if (!pathname) {
    return emptySpace;
  }

  const menuItems = menuItemsOverride ?? (role ? menuByRole[role] ?? [] : []);
  if (!menuItems || menuItems.length === 0) {
    return emptySpace;
  }

  const breadcrumbs = findBreadcrumbItems(pathname, menuItems);

  // 홈만 있는 경우 브레드크럼 표시 안 하지만 공간은 유지
  if (breadcrumbs.length <= 1) {
    return emptySpace;
  }

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-[1600px] px-6 py-4">
      <ol className="flex items-center justify-end gap-2 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={`${item.path}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isLast ? (
                <span className="font-medium text-gray-900">{item.label}</span>
              ) : (
                <Link
                  href={item.path}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
