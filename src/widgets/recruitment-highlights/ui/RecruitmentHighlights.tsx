'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  getPublicRecruitments,
  getPublicNotices,
  getPublicResources,
  type RecruitmentSummary,
  type NoticeSummary,
  type ResourceSummary,
} from '@/shared/api/public';

const HIGHLIGHT_SIZE = 4;

export function RecruitmentHighlights() {
  const [recruitments, setRecruitments] = useState<RecruitmentSummary[]>([]);
  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [isLoadingRecruitments, setIsLoadingRecruitments] = useState(true);
  const [isLoadingNotices, setIsLoadingNotices] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [recruitmentError, setRecruitmentError] = useState<string | null>(null);
  const [noticesError, setNoticesError] = useState<string | null>(null);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Fetch recruitments (public API)
    const fetchRecruitments = async () => {
      try {
        const response = await getPublicRecruitments({ page: 0, size: HIGHLIGHT_SIZE });
        if (!mounted) return;
        setRecruitments(response.content ?? []);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setRecruitmentError('모집공고 정보를 불러올 수 없습니다.');
      } finally {
        if (mounted) setIsLoadingRecruitments(false);
      }
    };

    // Fetch notices (public API)
    const fetchNotices = async () => {
      try {
        const response = await getPublicNotices({ page: 0, size: HIGHLIGHT_SIZE });
        if (!mounted) return;
        setNotices(response.content ?? []);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setNoticesError('공지사항 정보를 불러올 수 없습니다.');
      } finally {
        if (mounted) setIsLoadingNotices(false);
      }
    };

    // Fetch resources (public API)
    const fetchResources = async () => {
      try {
        const response = await getPublicResources({ page: 0, size: HIGHLIGHT_SIZE });
        if (!mounted) return;
        setResources(response.content ?? []);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setResourcesError('자료실 정보를 불러올 수 없습니다.');
      } finally {
        if (mounted) setIsLoadingResources(false);
      }
    };

    fetchRecruitments();
    fetchNotices();
    fetchResources();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="mx-auto mb-20 mt-9 max-w-[1600px] px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 최신 모집공고 */}
        <div className="flex-1 rounded-[20px] bg-white px-7 pb-5 pt-9 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-semibold leading-[33.6px] text-black">
              최신 모집공고
            </h2>
            <Link
              href="/recruitments"
              className="relative h-[15px] w-[15px] cursor-pointer after:absolute after:left-1/2 after:top-1/2 after:h-[1px] after:w-full after:-translate-x-1/2 after:-translate-y-1/2 after:bg-[#d9d9d9] after:content-[''] before:absolute before:left-0 before:h-[1px] before:w-full before:rotate-90 before:bg-[#d9d9d9] before:content-['']"
              aria-label="모집공고 더보기"
            />
          </div>

          <div className="mt-1.5">
            {isLoadingRecruitments && (
              <>
                {Array.from({ length: HIGHLIGHT_SIZE }).map((_, index) => (
                  <div
                    key={index}
                    className={`animate-pulse border-b border-black/10 py-4 ${index === HIGHLIGHT_SIZE - 1 ? 'border-b-0' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-[22px] flex-1 rounded bg-gray-200" />
                      <div className="h-[19px] w-[80px] rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {!isLoadingRecruitments && recruitmentError && (
              <div className="py-4 text-red-600">
                {recruitmentError}
              </div>
            )}

            {!isLoadingRecruitments && !recruitmentError && recruitments.length === 0 && (
              <div className="py-4 text-[14px] text-gray-500">
                현재 게시된 모집공고가 없습니다.
              </div>
            )}

            {!isLoadingRecruitments && !recruitmentError && recruitments.length > 0 && (
              <>
                {recruitments.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-2.5 border-b border-black/10 py-4 ${index === recruitments.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <Link
                      href={`/recruitments/${item.id}`}
                      className="flex-1 overflow-hidden text-[16px] leading-[22.4px] text-[#212121] hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="whitespace-nowrap text-[14px] leading-[19.6px] text-[#666666]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'numeric', 
                        day: 'numeric' 
                      }).replace(/\. /g, '. ') : ''}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 공지사항 */}
        <div className="flex-1 rounded-[20px] bg-white px-7 pb-5 pt-9 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-semibold leading-[33.6px] text-black">
              공지사항
            </h2>
            <Link
              href="/notices"
              className="relative h-[15px] w-[15px] cursor-pointer after:absolute after:left-1/2 after:top-1/2 after:h-[1px] after:w-full after:-translate-x-1/2 after:-translate-y-1/2 after:bg-[#d9d9d9] after:content-[''] before:absolute before:left-0 before:h-[1px] before:w-full before:rotate-90 before:bg-[#d9d9d9] before:content-['']"
              aria-label="공지사항 더보기"
            />
          </div>

          <div className="mt-1.5">
            {isLoadingNotices && (
              <>
                {Array.from({ length: HIGHLIGHT_SIZE }).map((_, index) => (
                  <div
                    key={index}
                    className={`animate-pulse border-b border-black/10 py-4 ${index === HIGHLIGHT_SIZE - 1 ? 'border-b-0' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-[22px] flex-1 rounded bg-gray-200" />
                      <div className="h-[19px] w-[80px] rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {!isLoadingNotices && noticesError && (
              <div className="py-4 text-red-600">
                {noticesError}
              </div>
            )}

            {!isLoadingNotices && !noticesError && notices.length === 0 && (
              <div className="py-4 text-[14px] text-gray-500">
                현재 게시된 공지사항이 없습니다.
              </div>
            )}

            {!isLoadingNotices && !noticesError && notices.length > 0 && (
              <>
                {notices.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2.5 border-b border-black/10 py-4 ${index === notices.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <Link
                      href={`/notices/${item.id}`}
                      className="flex-1 overflow-hidden text-[16px] leading-[22.4px] text-[#212121] hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="whitespace-nowrap text-[14px] leading-[19.6px] text-[#666666]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      }).replace(/\. /g, '. ') : ''}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 서식 및 자료실 */}
        <div className="flex-1 rounded-[20px] bg-white px-7 pb-5 pt-9 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-semibold leading-[33.6px] text-black">
              서식 및 자료실
            </h2>
            <Link
              href="/archives"
              className="relative h-[15px] w-[15px] cursor-pointer after:absolute after:left-1/2 after:top-1/2 after:h-[1px] after:w-full after:-translate-x-1/2 after:-translate-y-1/2 after:bg-[#d9d9d9] after:content-[''] before:absolute before:left-0 before:h-[1px] before:w-full before:rotate-90 before:bg-[#d9d9d9] before:content-['']"
              aria-label="서식 및 자료실 더보기"
            />
          </div>

          <div className="mt-1.5">
            {isLoadingResources && (
              <>
                {Array.from({ length: HIGHLIGHT_SIZE }).map((_, index) => (
                  <div
                    key={index}
                    className={`animate-pulse border-b border-black/10 py-4 ${index === HIGHLIGHT_SIZE - 1 ? 'border-b-0' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-[22px] flex-1 rounded bg-gray-200" />
                      <div className="h-[19px] w-[80px] rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {!isLoadingResources && resourcesError && (
              <div className="py-4 text-red-600">
                {resourcesError}
              </div>
            )}

            {!isLoadingResources && !resourcesError && resources.length === 0 && (
              <div className="py-4 text-[14px] text-gray-500">
                현재 게시된 자료가 없습니다.
              </div>
            )}

            {!isLoadingResources && !resourcesError && resources.length > 0 && (
              <>
                {resources.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2.5 border-b border-black/10 py-4 ${index === resources.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <Link
                      href={`/archives/${item.id}`}
                      className="flex-1 overflow-hidden text-[16px] leading-[22.4px] text-[#212121] hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="whitespace-nowrap text-[14px] leading-[19.6px] text-[#666666]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      }).replace(/\. /g, '. ') : ''}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
