'use client';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = '이름 검색',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row lg:gap-2 ${className}`}>
      <div className="relative flex-1">
        <div className="relative h-12 w-full sm:w-80">
          <div className="absolute top-0 left-0 h-12 w-full rounded-[10px] border border-neutral-300 bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] sm:w-80" />

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="absolute top-[9px] left-[23px] h-8 w-full bg-transparent text-left text-[20px] font-semibold placeholder-neutral-400 focus:text-neutral-700 focus:outline-none sm:w-64"
          />

          <div className="absolute top-[9px] right-[23px] flex h-8 w-8 items-center justify-center">
            <svg
              className="h-6 w-6 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
