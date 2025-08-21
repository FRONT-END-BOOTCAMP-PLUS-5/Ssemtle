'use client';

import { useRouter } from 'next/navigation';

type CategoryCardProps = {
  name: string;
  unitId: number;
};

const CategoryCard = ({ name, unitId }: CategoryCardProps) => {
  // 카드 클릭 시 문제풀기 페이지로 이동하며 unitId 쿼리 전달 (PracticePageContent 스펙 준수)
  const router = useRouter();
  const onClickCategoryCard = () => {
    try {
      router.push(`/practice?unitId=${encodeURIComponent(unitId)}`);
    } catch (error) {
      console.error(error);
      alert('이동 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div
      className="flex h-50 w-60 cursor-pointer items-center justify-center rounded-3xl bg-card-background text-lg shadow-sm transition-all duration-200 ease-out hover:-translate-y-[5px] hover:shadow-lg max-[970px]:w-50 max-[630px]:w-60"
      onClick={onClickCategoryCard}
    >
      {name}
    </div>
  );
};

export default CategoryCard;
