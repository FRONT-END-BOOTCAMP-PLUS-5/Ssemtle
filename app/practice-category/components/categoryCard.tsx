'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface CategoryCardProps {
  /** 카드 제목 */
  title: string;
  /** 부가 설명 */
  description?: string;
  /** 연결될 단원 아이디 */
  unitId: number;
  /** 단원 이름 - 이동 시 쿼리로 전달 */
  unitName: string;
  /** 배경색/강조색 클래스 (tailwind) */
  accentClass?: string;
  /** 네비게이션 시작 콜백 (상위에서 로딩 상태 관리) */
  onNavigateStart?: () => void;
  /** 네비게이션 에러 콜백 (상위에서 로딩 상태 해제) */
  onNavigateError?: () => void;
  /** 카드 비활성화 여부 (중복 클릭 방지) */
  isDisabled?: boolean;
}

/**
 * 카테고리 카드 컴포넌트
 * - 제목/설명을 보여주고 클릭 시 해당 단원으로 이동
 * - 반응형 레이아웃과 hover 인터랙션 제공
 */
const CategoryCard = ({
  title,
  description,
  unitId,
  unitName,
  accentClass,
  onNavigateStart,
  onNavigateError,
  isDisabled,
}: CategoryCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    try {
      // 네비게이션 시작 알림 및 로딩 토스트 노출
      onNavigateStart?.();
      toast.loading('이동 중입니다... 잠시만 기다려주세요.', {
        autoClose: 2500,
        closeOnClick: false,
        hideProgressBar: true,
      });
      router.push(
        `/practice?unitId=${encodeURIComponent(unitId)}&unitName=${encodeURIComponent(unitName)}`
      );
    } catch (error) {
      console.error(error);
      onNavigateError?.();
      toast.error('이동 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`group relative flex h-48 w-full flex-col justify-between rounded-3xl border border-gray-100 p-6 text-left shadow-sm transition-all duration-200 ease-out ${
        isDisabled
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:-translate-y-1 hover:shadow-md'
      } ${accentClass ?? 'bg-white'}`}
    >
      <div className="text-lg font-semibold">{title}</div>
      {description ? (
        <div className="mt-3 line-clamp-2 text-sm text-gray-600">
          {description}
        </div>
      ) : null}
      <div className="absolute top-6 right-6 text-gray-400 transition-transform group-hover:translate-x-1">
        →
      </div>
    </button>
  );
};

export default CategoryCard;
