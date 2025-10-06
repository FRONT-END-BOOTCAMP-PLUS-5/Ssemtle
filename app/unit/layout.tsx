import { createMetadata } from '@/libs/metadata';

export const metadata = createMetadata({
  title: '단원평가',
  description:
    '단원평가 코드를 입력하여 시험을 응시하세요. 단원별 실력을 평가하고 학습 성과를 확인할 수 있습니다.',
  path: '/unit',
  keywords: [
    '단원평가',
    '수학 평가',
    '단원 시험',
    '실력 평가',
    '단원평가 코드',
  ],
});

export default function UnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
