'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseDragAndDropProps {
  isDraggable: boolean;
  onExpansionChange?: (isExpanded: boolean) => void;
  constrainToViewport: (x: number, y: number) => { x: number; y: number };
  autoAdjustPosition: () => void;
}

interface UseDragAndDropReturn {
  isDragging: boolean;
  isDragModeEnabled: boolean;
  position: { x: number; y: number };
  isExpanded: boolean;
  dragHandleRef: React.RefObject<HTMLButtonElement | null>;
  setIsExpanded: (expanded: boolean) => void;
  setPosition: (position: { x: number; y: number }) => void;
  disableDragMode: () => void;
  handleClick: () => void;
}

export function useDragAndDrop({
  isDraggable,
  onExpansionChange,
  constrainToViewport,
  autoAdjustPosition,
}: UseDragAndDropProps): UseDragAndDropReturn {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const dragHandleRef = useRef<HTMLButtonElement | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragModeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handleLongPress = useCallback(() => {
    if (!isDraggable) return;
    setIsDragModeEnabled(true);
    isLongPressRef.current = true;
  }, [isDraggable]);

  const disableDragMode = useCallback(() => {
    setIsDragModeEnabled(false);
    if (dragModeTimeoutRef.current) {
      clearTimeout(dragModeTimeoutRef.current);
      dragModeTimeoutRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isLongPressRef.current) {
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      onExpansionChange?.(newExpanded);
    }
    isLongPressRef.current = false;
  }, [isExpanded, onExpansionChange]);

  // Gesture detection and draggable functionality
  useEffect(() => {
    if (!isDraggable || !dragHandleRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isLongPressRef.current = false;

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        handleLongPress();
      }, 500); // 500ms for long press

      // Only start dragging if drag mode is enabled
      if (isDragModeEnabled) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    };

    const handleMouseUp = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!isLongPressRef.current && !isDragging) {
        handleClick();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      isLongPressRef.current = false;

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        handleLongPress();
      }, 500); // 500ms for long press

      // Only start dragging if drag mode is enabled
      if (isDragModeEnabled) {
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      }
    };

    const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!isLongPressRef.current && !isDragging) {
        handleClick();
      }
    };

    const dragHandle = dragHandleRef.current;
    dragHandle.addEventListener('mousedown', handleMouseDown);
    dragHandle.addEventListener('mouseup', handleMouseUp);
    dragHandle.addEventListener('touchstart', handleTouchStart);
    dragHandle.addEventListener('touchend', handleTouchEnd);

    return () => {
      dragHandle.removeEventListener('mousedown', handleMouseDown);
      dragHandle.removeEventListener('mouseup', handleMouseUp);
      dragHandle.removeEventListener('touchstart', handleTouchStart);
      dragHandle.removeEventListener('touchend', handleTouchEnd);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [
    isDraggable,
    position.x,
    position.y,
    isDragModeEnabled,
    isDragging,
    handleLongPress,
    handleClick,
  ]);

  // Handle drag movement
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = constrainToViewport(
        e.clientX - dragStart.x,
        e.clientY - dragStart.y
      );
      setPosition(newPosition);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newPosition = constrainToViewport(
        touch.clientX - dragStart.x,
        touch.clientY - dragStart.y
      );
      setPosition(newPosition);
    };

    const handleEnd = () => {
      setIsDragging(false);

      // Auto-adjust position after dragging ends
      setTimeout(() => {
        autoAdjustPosition();
      }, 100);

      // Start 1-second timeout to disable drag mode after drag ends
      if (dragModeTimeoutRef.current) {
        clearTimeout(dragModeTimeoutRef.current);
      }
      dragModeTimeoutRef.current = setTimeout(() => {
        setIsDragModeEnabled(false);
      }, 1000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [
    isDragging,
    dragStart.x,
    dragStart.y,
    constrainToViewport,
    autoAdjustPosition,
  ]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (dragModeTimeoutRef.current) {
        clearTimeout(dragModeTimeoutRef.current);
      }
    };
  }, []);

  return {
    isDragging,
    isDragModeEnabled,
    position,
    isExpanded,
    dragHandleRef,
    setIsExpanded,
    setPosition,
    disableDragMode,
    handleClick,
  };
}
