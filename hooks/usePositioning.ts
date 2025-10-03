'use client';

import { useCallback, useEffect } from 'react';

interface UsePositioningProps {
  isDraggable: boolean;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  elementRef: React.RefObject<HTMLDivElement | null>;
}

interface UsePositioningReturn {
  constrainToViewport: (x: number, y: number) => { x: number; y: number };
  autoAdjustPosition: () => void;
}

export function usePositioning({
  isDraggable,
  position,
  setPosition,
  elementRef,
}: UsePositioningProps): UsePositioningReturn {
  // Constrain position to viewport boundaries
  const constrainToViewport = useCallback(
    (x: number, y: number) => {
      if (!elementRef.current) return { x, y };

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate boundaries (with small padding)
      const padding = 16;
      const minX = padding - rect.width + 100; // Allow partial visibility
      const maxX = viewportWidth - padding - 100; // Allow partial visibility
      const minY = padding;
      const maxY = viewportHeight - rect.height - padding;

      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      };
    },
    [elementRef]
  );

  // Auto-adjust position to ensure component is fully visible
  const autoAdjustPosition = useCallback(() => {
    if (!elementRef.current || !isDraggable) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;

    let newX = position.x;
    let newY = position.y;
    let needsAdjustment = false;

    // Check if component is fully visible
    if (rect.left < padding) {
      newX = padding;
      needsAdjustment = true;
    } else if (rect.right > viewportWidth - padding) {
      newX = viewportWidth - rect.width - padding;
      needsAdjustment = true;
    }

    if (rect.top < padding) {
      newY = padding;
      needsAdjustment = true;
    } else if (rect.bottom > viewportHeight - padding) {
      newY = viewportHeight - rect.height - padding;
      needsAdjustment = true;
    }

    if (needsAdjustment) {
      setPosition({ x: newX, y: newY });
    }
  }, [position.x, position.y, isDraggable, elementRef, setPosition]);

  // Handle viewport resize to keep element in bounds
  useEffect(() => {
    if (!isDraggable) return;

    const handleResize = () => {
      autoAdjustPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDraggable, autoAdjustPosition]);

  return {
    constrainToViewport,
    autoAdjustPosition,
  };
}
