'use client';

type SearchInputProps = {
  /** 현재 입력 값 */
  value: string;
  /** 입력 값 변경 핸들러 */
  onChange: (value: string) => void;
  /** 제출 핸들러 (버튼 클릭/Enter) */
  onSubmit: () => void;
  /** placeholder 텍스트 */
  placeholder?: string;
};

/**
 * 카테고리 검색 인풋 컴포넌트
 * - 부모로부터 value/onChange/onSubmit을 전달받아 제어됨
 * - 접근성 및 엔터 제출 지원
 */
const SearchInput = ({
  value,
  onChange,
  onSubmit,
  placeholder,
}: SearchInputProps) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2">
        <input
          type="text"
          placeholder={placeholder ?? '카테고리 검색'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-64 bg-transparent text-base outline-none max-[420px]:w-44"
          aria-label="카테고리 검색"
        />
      </div>
      <button
        onClick={onSubmit}
        className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700"
        aria-label="검색"
      >
        검색
      </button>
    </div>
  );
};

export default SearchInput;
