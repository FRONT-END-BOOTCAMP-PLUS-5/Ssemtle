'use client';

import { useMemo } from 'react';

export type FocusZone = 'none' | 'problem' | 'answer';

export interface ErrorNoteProblem {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  helpText: string;
  instruction?: string;
  unitName?: string;
  videoUrl?: string;
}

interface HelpContent {
  title: string;
  content: string;
  videoUrl?: string;
  showContent: boolean;
}

interface UseHelpContentProps {
  focusZone: FocusZone;
  currentProblem?: ErrorNoteProblem;
  isExpanded: boolean;
  componentId?: string;
}

export function useHelpContent({
  focusZone,
  currentProblem,
  isExpanded,
}: UseHelpContentProps): HelpContent {
  const helpContent = useMemo(() => {
    if (focusZone === 'none' || !currentProblem) {
      return {
        title: isExpanded ? '도움말 접기' : '도움말 펼치기',
        content:
          '문제나 답안 영역을 클릭하면 관련 도움말이 표시됩니다.\n여기를 클릭하면 접습니다.\n길게 클릭하면 옮길 수 있습니다.',
        videoUrl: undefined,
        showContent: false,
      };
    }

    switch (focusZone) {
      case 'problem':
        return {
          title: '문제 분석',
          content: `문제: ${currentProblem.question}\n\n이 문제는 ${currentProblem.instruction || '수학 문제'}입니다.\n\n정답: ${currentProblem.correctAnswer}\n당신의 답: ${currentProblem.userAnswer}`,
          videoUrl: currentProblem.videoUrl,
          showContent: true,
        };
      case 'answer':
        return {
          title: isExpanded ? '도움말 접기' : '도움말 펼치기',
          content:
            currentProblem.helpText || '이 문제에 대한 자세한 설명이 없습니다.',
          videoUrl: currentProblem.videoUrl,
          showContent: true,
        };
      default:
        return {
          title: isExpanded ? '도움말 접기' : '도움말 펼치기',
          content:
            '문제나 답안 영역을 클릭하면 관련 도움말이 표시됩니다.\n 여기를 클릭하면 접습니다.\n길게 클릭하면 옮길 수 있습니다.',
          videoUrl: undefined,
          showContent: false,
        };
    }
  }, [focusZone, currentProblem, isExpanded]);

  return helpContent;
}
