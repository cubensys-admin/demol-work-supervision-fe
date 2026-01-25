'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { classNames } from '@/shared/lib/classNames'
import { useAuthStore } from '@/shared/model/authStore'
import { getRoleLabel, menuByRole, type MenuItem } from '@/components/layout/menuConfig'

type RoleSidebarProps = {
  className?: string
}

const isPathActive = (pathname: string, targetPath: string) => {
  if (!pathname) return false
  if (targetPath === '/') {
    return pathname === '/'
  }
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`)
}

const hasActiveSubItem = (pathname: string, subItems: MenuItem['subItems']) => {
  if (!subItems || subItems.length === 0) {
    return false
  }

  return subItems.some((subItem) => isPathActive(pathname, subItem.path))
}

export function RoleSidebar({ className }: RoleSidebarProps) {
  const pathname = usePathname()
  const role = useAuthStore((state) => state.role)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const initializedRef = useRef(false)

  const menuItems = role ? menuByRole[role] ?? [] : []
  // 사이드바에서는 "소개" 메뉴 숨김 (헤더에는 표시)
  const filteredMenuItems = menuItems.filter(item => item.label !== '소개')
  const roleLabel = getRoleLabel(role) ?? '서비스 메뉴'

  // 초기 마운트 시 현재 페이지의 메뉴를 확장 상태로 설정
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const activeMenuPaths = filteredMenuItems
      .filter(item => item.subItems && hasActiveSubItem(pathname, item.subItems))
      .map(item => item.path)

    if (activeMenuPaths.length > 0) {
      setExpandedMenus(new Set(activeMenuPaths))
    }
  }, [pathname, filteredMenuItems])

  if (filteredMenuItems.length === 0) {
    return null
  }

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  return (
    <aside
      className={classNames(
        'w-[210px] flex-shrink-0 rounded-[20px] border border-gray-100 bg-white px-5 py-5 shadow-[2px_4px_20px_rgba(0,0,0,0.10)]',
        className,
      )}
    >
      <p
        className="mb-4 text-left text-black"
        style={{
          fontSize: '18px',
          fontWeight: 700,
          lineHeight: 'normal',
          letterSpacing: '-0.45px',
        }}
      >
        {roleLabel}
      </p>
      <div className="mb-4 h-px w-full bg-[#D2D2D2]" />

      <nav className="flex flex-col gap-1">
        {filteredMenuItems.map((item) => {
          const hasSubItems = Boolean(item.subItems && item.subItems.length > 0)
          const sectionActive = hasActiveSubItem(pathname, item.subItems)
          const isExpanded = expandedMenus.has(item.path)
          const itemActive = isPathActive(pathname, item.path) && !hasSubItems
          const baseItemStyle = {
            color: '#000',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: 'normal' as const,
            letterSpacing: '-0.4px',
          }
          const activeItemStyle = {
            ...baseItemStyle,
            color: '#0082FF',
          }

          return (
            <div key={item.path}>
              {hasSubItems ? (
                <button
                  type="button"
                  onClick={() => toggleMenu(item.path)}
                  className="flex w-full items-center justify-between rounded-md py-2.5 text-left transition-colors hover:bg-gray-50"
                  style={sectionActive ? activeItemStyle : baseItemStyle}
                >
                  <span>{item.label}</span>
                  <svg
                    className={classNames('h-6 w-6 text-black transition-transform', isExpanded ? 'rotate-180' : '')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      d="M6 15L12 9L18 15"
                      stroke="black"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : (
                <Link
                  href={item.path}
                  className={classNames(
                    'flex w-full items-center rounded-md py-2.5 text-left transition-colors hover:bg-gray-50',
                    itemActive
                      ? 'bg-[#E6F1FF]'
                      : undefined,
                  )}
                  style={itemActive ? activeItemStyle : baseItemStyle}
                >
                  {item.label}
                </Link>
              )}

              {hasSubItems && isExpanded && (
                <div className="mt-1 flex flex-col gap-0.5">
                  {item.subItems!.map((subItem) => {
                    const subActive = isPathActive(pathname, subItem.path)
                    const subStyle = subActive
                      ? {
                          color: '#FFF',
                          fontSize: '14px',
                          fontStyle: 'normal' as const,
                          fontWeight: 400,
                          lineHeight: 'normal' as const,
                          letterSpacing: '-0.35px',
                        }
                      : {
                          color: '#000',
                          fontSize: '14px',
                          fontStyle: 'normal' as const,
                          fontWeight: 400,
                          lineHeight: 'normal' as const,
                          letterSpacing: '-0.35px',
                        }
                    return (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        className={classNames(
                          'rounded-[10px] py-2.5 text-left transition-colors',
                          subActive
                            ? 'bg-[#0082FF] pl-6 hover:text-white'
                            : 'pl-3 hover:bg-gray-50',
                        )}
                        style={subStyle}
                      >
                        {subItem.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
