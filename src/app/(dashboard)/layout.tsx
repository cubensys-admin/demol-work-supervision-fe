'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/widgets/site-header/SiteHeader'
import Footer from '@/components/layout/Footer'
import { RoleSidebar } from '@/components/layout/RoleSidebar'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SubVisual } from '@/components/layout/SubVisual'
import { useAuthStore } from '@/shared/model/authStore'
import { getAccessToken } from '@/shared/lib/authToken'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for token in localStorage first
    const accessToken = getAccessToken()
    if (!accessToken) {
      router.push('/login')
    } else {
      hydrate()
      setIsLoading(false)
    }
  }, [hydrate, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <div className="pt-[120px]">
        <SubVisual />

        {/* 브래드크럼 영역 */}
        <Breadcrumb />

        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 pb-12 lg:flex-row">
          <RoleSidebar className="lg:sticky lg:top-[140px]" />

          <main className="flex-1 min-w-0 min-h-[600px]">{children}</main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
