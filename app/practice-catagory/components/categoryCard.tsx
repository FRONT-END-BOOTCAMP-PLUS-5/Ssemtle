'use client';

type CategoryCardProps = {
  name: string;
};

const CategoryCard = ({ name }: CategoryCardProps) => {
  const onClickCategoryCard = () => {
    // 클릭 시 카드의 이름을 알림으로 표시
    alert(name);
  };

  return (
    <div
      className="flex h-50 w-75 items-center justify-center rounded-3xl bg-card-background text-lg max-[970px]:w-50 max-[630px]:w-75"
      onClick={onClickCategoryCard}
    >
      {name}
    </div>
  );
};

export default CategoryCard;
