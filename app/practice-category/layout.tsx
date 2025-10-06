import { createMetadata } from '@/libs/metadata';

export const metadata = createMetadata({
  title: '학습 단원 선택',
  description:
    '학습할 단원을 선택하세요. 초등, 중등, 고등 수학의 다양한 단원별 문제를 풀 수 있습니다. 출석 체크로 매일 학습 습관을 만들어보세요.',
  path: '/practice-category',
  keywords: ['단원 선택', '학습 단원', '수학 단원', '단원별 학습', '출석 체크'],
});

export default function PracticeCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
