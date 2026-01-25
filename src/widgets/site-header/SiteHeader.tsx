'use client';

import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { login } from "@/features/auth/login/api/login";
import type { LoginRequest } from "@/features/auth/login/model/types";
import { classNames } from "@/shared/lib/classNames";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Input } from "@/shared/ui/input";
import { useAuthStore } from "@/shared/model/authStore";
import { clearAccessToken } from "@/shared/lib/authToken";
import { defaultMenu, menuByRole } from "@/components/layout/menuConfig";
import type { MenuItem } from "@/components/layout/menuConfig";

type NavigationItem = {
  label: string;
  href: string;
  children?: NavigationItem[];
  requiresAuth?: boolean;
};

// MenuItem을 NavigationItem으로 변환
const convertMenuItem = (item: MenuItem, requiresAuth: boolean = false): NavigationItem => ({
  label: item.label,
  href: item.path,
  children: item.subItems?.map(sub => ({
    label: sub.label,
    href: sub.path,
  })),
  requiresAuth,
});

export function SiteHeader() {
  const token = useAuthStore((state) => state.token);
  const username = useAuthStore((state) => state.username);
  const role = useAuthStore((state) => state.role);
  const clear = useAuthStore((state) => state.clear);
  const hydrate = useAuthStore((state) => state.hydrate);
  const router = useRouter();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "password123",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const performLogin = async (payload: LoginRequest) => {
    setIsSubmitting(true);
    try {
      await login(payload);
      setCredentials({ username: "", password: "password123" });
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    await performLogin(credentials);
  };

  const handleQuickLogin = async (payload: LoginRequest) => {
    if (isSubmitting) return;

    await performLogin(payload);
  };

  const quickLoginOptions: { label: string; credentials: LoginRequest }[] = [
    { label: "감리자", credentials: { username: "ins_sb_0001", password: "password123" } },
    { label: "구청", credentials: { username: "gangnam_officer", password: "password123" } },
    { label: "시청", credentials: { username: "city_manager", password: "password123" } },
    { label: "건축사회", credentials: { username: "architect_admin", password: "password123" } },
  ];

  const handleLogout = () => {
    clear();
    clearAccessToken();
    setCredentials({ username: "", password: "password123" });
    router.push("/");
  };

  const baseNavigationItems = useMemo<NavigationItem[]>(
    () => defaultMenu.map(item => {
      // '등재 신청/조회'와 '해체공사감리'는 로그인 필요
      const requiresAuth = item.label === '등재 신청/조회' || item.label === '해체공사감리';
      return convertMenuItem(item, requiresAuth);
    }),
    [],
  );

  const effectiveNavItems = useMemo<NavigationItem[]>(() => {
    if (token && role) {
      // 로그인 사용자는 역할별 메뉴 사용
      const roleMenu = menuByRole[role] ?? [];
      return roleMenu.map(item => convertMenuItem(item, true));
    }

    // 비로그인 사용자는 기본 메뉴 사용
    return baseNavigationItems;
  }, [baseNavigationItems, token, role]);

  const [activeTopIndex, setActiveTopIndex] = useState<number | null>(null);
  const [activeSecondIndex, setActiveSecondIndex] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleProtectedNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    item: NavigationItem,
  ) => {
    if (!token && item.requiresAuth) {
      event.preventDefault();
      toast.info("로그인이 필요한 서비스입니다.");
    }
  };

  useEffect(() => {
    setActiveTopIndex(null);
    setActiveSecondIndex(0);
  }, [token]);

  useEffect(() => {
    setActiveSecondIndex(0);
  }, [activeTopIndex]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const cancelCloseMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleCloseMenu = () => {
    cancelCloseMenu();
    closeTimerRef.current = setTimeout(() => {
      setActiveTopIndex(null);
      setActiveSecondIndex(0);
      closeTimerRef.current = null;
    }, 200);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 min-h-[100px] bg-white/90 backdrop-blur-[20px] backdrop-brightness-100">
      <Container className="flex flex-col gap-3 pb-3">
        <div className="flex items-center justify-between gap-5">
          <Link href="/" className="mt-[25px] flex h-[50px] w-[210px] shrink-0 items-center justify-center">
            <Image
              src="/assets/landing/logo-1.png"
              alt="서울특별시 건축물 해체 공사 감리 시스템 로고"
              width={83}
              height={50}
              priority
            />
          </Link>

          <nav
            className="mt-8 hidden items-center gap-6 text-[20px] font-medium leading-[28px] tracking-[-0.5px] text-heading md:inline-flex"
            onMouseLeave={scheduleCloseMenu}
            onMouseEnter={cancelCloseMenu}
          >
            {effectiveNavItems.map((item, index) => {
              const childItems = item.children ?? [];
              const hasChildren = childItems.length > 0;
              const isActiveTop = activeTopIndex === index;
              const activeChild = isActiveTop ? childItems[activeSecondIndex] ?? childItems[0] : undefined;
              const thirdLevelChildren = activeChild?.children ?? [];

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => {
                    cancelCloseMenu();
                    setActiveTopIndex(index);
                    setActiveSecondIndex(0);
                  }}
                >
                  <Link
                    href={item.href}
                    className={classNames(
                      "whitespace-nowrap transition-colors",
                      isActiveTop ? "text-primary-600" : "text-heading",
                    )}
                    onFocus={() => {
                      setActiveTopIndex(index);
                      setActiveSecondIndex(0);
                    }}
                    onClick={(event) => handleProtectedNavigation(event, item)}
                  >
                    {item.label}
                  </Link>

                  {hasChildren && isActiveTop && (
                    <div className="absolute left-0 top-full z-50 mt-3 flex gap-4">
                      <div className="flex min-w-[200px] flex-col rounded-lg border border-gray-200 bg-white py-3 shadow-lg">
                        {childItems.map((child, childIndex) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={classNames(
                              "px-4 py-2 text-[16px] leading-[24px] text-secondary transition-colors",
                              childIndex === activeSecondIndex
                                ? "text-primary-600"
                                : "hover:text-primary-600",
                            )}
                            onMouseEnter={() => {
                              cancelCloseMenu();
                              setActiveSecondIndex(childIndex);
                            }}
                            onFocus={() => setActiveSecondIndex(childIndex)}
                            onClick={(event) => handleProtectedNavigation(event, child)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>

                      {thirdLevelChildren.length > 0 && (
                        <div
                          className="flex min-w-[200px] flex-col rounded-lg border border-gray-200 bg-white py-3 shadow-lg"
                          onMouseEnter={cancelCloseMenu}
                        >
                          {thirdLevelChildren.map((third) => (
                            <Link
                              key={third.label}
                              href={third.href}
                              className="px-4 py-2 text-[15px] leading-[22px] text-secondary transition-colors hover:text-primary-600"
                              onClick={(event) => handleProtectedNavigation(event, third)}
                            >
                              {third.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {token ? (
            <div className="ml-auto mt-8 hidden items-center gap-[14px] lg:flex">
              <span className="text-[15px] font-medium leading-[140%] tracking-[-0.375px] text-[#010101]">{username}</span>
              <Image src="/assets/landing/User_01.svg" alt="" width={24} height={24} />
              <div className="h-[14px] w-px bg-[#D2D2D2]" />
              <button type="button" onClick={handleLogout} aria-label="로그아웃">
                <Image src="/assets/landing/Log_Out.svg" alt="로그아웃" width={24} height={24} />
              </button>
            </div>
          ) : (
            <div className="ml-auto mt-8 hidden items-center gap-4 lg:flex">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  className="w-[110px]"
                  name="username"
                  placeholder="아이디를 입력해 주세요."
                  value={credentials.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
                <Input
                  className="w-[110px]"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력해 주세요."
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "로그인 중..." : "로그인"}
                </Button>
              </form>
              <div className="flex items-center gap-2">
                {quickLoginOptions.map((option) => (
                  <Button
                    key={option.credentials.username}
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleQuickLogin(option.credentials)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            aria-label="메뉴 열기"
            className="ml-auto mt-[37px] inline-flex h-6 w-7 flex-shrink-0 flex-col justify-between md:hidden"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                key={index}
                className={classNames(
                  "block h-0.5 w-full bg-ink",
                  index === 1 ? "opacity-90" : "opacity-80",
                )}
              />
            ))}
          </button>
        </div>
      </Container>
    </header>
  );
}
