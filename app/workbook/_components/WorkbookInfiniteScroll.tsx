'use client';

import { useEffect, useRef } from 'react';

interface WorkbookInfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  dataLength: number;
}

export default function WorkbookInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  dataLength,
}: WorkbookInfiniteScrollProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  // Stable handler that doesn't change on every render
  const handleIntersection = useRef(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          observer.unobserve(entry.target);
          fetchNextPage();
        }
      });
    }
  );

  // Update the handler closure with current values
  handleIntersection.current = (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        observer.unobserve(entry.target);
        fetchNextPage();
      }
    });
  };

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => handleIntersection.current(entries, observer),
      {
        root: null,
        rootMargin: '20px',
        threshold: 0,
      }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [dataLength]); // Only recreate when content changes

  // Re-observe when fetch completes
  useEffect(() => {
    if (!isFetchingNextPage && hasNextPage && loaderRef.current) {
      const observer = new IntersectionObserver(
        (entries) => handleIntersection.current(entries, observer),
        {
          root: null,
          rootMargin: '20px',
          threshold: 0,
        }
      );
      observer.observe(loaderRef.current);

      return () => observer.disconnect();
    }
  }, [isFetchingNextPage, hasNextPage]);

  return (
    <>
      {/* Loading next page indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Intersection observer target for infinite scrolling */}
      {hasNextPage && <div ref={loaderRef} className="h-4 w-full" />}

      {/* End of results indicator */}
      {!hasNextPage && (
        <div className="flex justify-center py-6">
          <div className="text-sm text-gray-500">
            모든 문제 풀이 기록을 불러왔습니다
          </div>
        </div>
      )}
    </>
  );
}
