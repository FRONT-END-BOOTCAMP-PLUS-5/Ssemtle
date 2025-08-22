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
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder={placeholder ?? '카테고리 검색'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-72 rounded-lg border border-gray-300 px-4 py-2 text-base outline-none focus:border-blue-500"
      />
      <button
        onClick={onSubmit}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
      >
        검색
      </button>
    </div>
  );
};

export default SearchInput;
