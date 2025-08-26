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
  const targetSection = useRef<string>('');
  const targetClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          if (now - lastUpdateTime.current > 25) {
            lastUpdateTime.current = now;

            // Smart navigation logic: only update if no target or we've reached the target
            if (
              !targetSection.current ||
              mostVisibleSection === targetSection.current
            ) {
              // Clear target when we reach it
              if (targetSection.current === mostVisibleSection) {
                targetSection.current = '';
                // Clear the fallback timeout since we reached the target
                if (targetClearTimeoutRef.current) {
                  clearTimeout(targetClearTimeoutRef.current);
                  targetClearTimeoutRef.current = null;
                }
              }
              isUpdatingFromScroll.current = true;
              setActiveSection(mostVisibleSection);
            }
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
      if (targetClearTimeoutRef.current) {
        clearTimeout(targetClearTimeoutRef.current);
      }
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
        // Clear any existing target timeout
        if (targetClearTimeoutRef.current) {
          clearTimeout(targetClearTimeoutRef.current);
        }

        // Set target section for smart navigation
        targetSection.current = sectionId;
        isUpdatingFromScroll.current = false; // This is intentional navigation

        const element = document.getElementById(sectionId);
        if (element) {
          // Update state and URL immediately for responsive navigation
          setActiveSection(sectionId);
          window.history.replaceState(null, '', `${pathname}#${sectionId}`);
          scrollToElementSmoothly(element);

          // Fallback: Clear target after 1 second if observer doesn't detect it
          targetClearTimeoutRef.current = setTimeout(() => {
            targetSection.current = '';
            targetClearTimeoutRef.current = null;
          }, 1000);
        }
      }
    },
    [sectionIds, pathname, scrollToElementSmoothly]
  );

  return { activeSection, scrollToSection };
}
