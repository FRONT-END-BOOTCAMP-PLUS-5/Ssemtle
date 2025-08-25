'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface UseScrollspyOptions {
  sectionIds: string[];
  offset?: number;
}

export function useScrollspy({ sectionIds, offset = 0 }: UseScrollspyOptions) {
  const [activeSection, setActiveSection] = useState<string>('');
  const pathname = usePathname();
  const isUpdatingFromScroll = useRef(false);
  const lastUpdateTime = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollToElementSmoothly = useCallback((element: HTMLElement) => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the section that's most visible
        let maxVisibility = 0;
        let mostVisibleSection = '';

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
            maxVisibility = entry.intersectionRatio;
            mostVisibleSection = entry.target.id;
          }
        });

        if (mostVisibleSection) {
          const now = Date.now();
          // Throttle updates to prevent excessive calls
          if (now - lastUpdateTime.current > 100) {
            lastUpdateTime.current = now;
            isUpdatingFromScroll.current = true;
            setActiveSection(mostVisibleSection);
          }
        }
      },
      {
        rootMargin: `${-offset}px 0px ${-offset}px 0px`,
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
      }
    );

    // Validate and observe elements
    const validElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    validElements.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sectionIds, offset]);

  // Update URL when active section changes from scrolling
  useEffect(() => {
    if (
      activeSection &&
      sectionIds.includes(activeSection) &&
      isUpdatingFromScroll.current
    ) {
      const currentHash = window.location.hash.slice(1);
      if (currentHash !== activeSection) {
        // Use history.replaceState directly to avoid Next.js router overhead
        window.history.replaceState(null, '', `${pathname}#${activeSection}`);
      }
      isUpdatingFromScroll.current = false;
    }
  }, [activeSection, pathname, sectionIds]);

  // Handle initial hash on page load
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && sectionIds.includes(hash)) {
      setActiveSection(hash);
      // Small delay to ensure elements are rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          scrollToElementSmoothly(element);
        }
      }, 100);
    } else if (sectionIds.length > 0 && !hash && !activeSection) {
      // Set first section as default only if no hash and no active section
      setActiveSection(sectionIds[0]);
    }
  }, [sectionIds, scrollToElementSmoothly, activeSection]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sectionIds.includes(hash) && hash !== activeSection) {
        isUpdatingFromScroll.current = false; // This is from navigation, not scrolling
        setActiveSection(hash);
        const element = document.getElementById(hash);
        if (element) {
          scrollToElementSmoothly(element);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sectionIds, activeSection, scrollToElementSmoothly]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (sectionIds.includes(sectionId)) {
        isUpdatingFromScroll.current = false; // This is intentional navigation
        const element = document.getElementById(sectionId);
        if (element) {
          scrollToElementSmoothly(element);
          // Update the URL immediately for navigation clicks
          window.history.replaceState(null, '', `${pathname}#${sectionId}`);
          setActiveSection(sectionId);
        }
      }
    },
    [sectionIds, pathname, scrollToElementSmoothly]
  );

  return { activeSection, scrollToSection };
}
