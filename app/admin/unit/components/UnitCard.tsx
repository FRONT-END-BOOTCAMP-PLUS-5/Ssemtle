'use client';

import { UnitDto } from '@/backend/admin/units/dtos/UnitDto';

interface UnitCardProps {
  unit: UnitDto;
  onEdit?: (unit: UnitDto) => void;
  onDelete?: (unit: UnitDto) => void;
}

const getFontSize = (textLength: number) => {
  if (textLength <= 5) return 'text-xl md:text-base sm:text-2xl';
  if (textLength <= 7) return 'text-lg sm:text-xl';
  if (textLength <= 10) return 'text-base sm:text-lg';
  if (textLength <= 15) return 'text-sm md:text-xs sm:text-base';
  return 'text-xs sm:text-sm';
};

export default function UnitCard({ unit, onEdit, onDelete }: UnitCardProps) {
  return (
    <div className="h-[140px] w-full rounded-2xl border border-purple-100 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-100/50 sm:h-[150px] md:h-[160px]">
      <div className="h-full p-4 sm:p-5 md:p-6">
        <div className="flex h-full flex-col justify-between">
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <h3
              className={`w-full px-1 text-center font-black text-gray-900 ${getFontSize(unit.name.length)}`}
            >
              {unit.name}
            </h3>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              className="flex-1 cursor-pointer rounded-md border border-purple-200 bg-transparent text-xs font-medium whitespace-nowrap text-purple-700 hover:bg-purple-50 sm:text-sm"
              onClick={() => onEdit?.(unit)}
            >
              수정
            </button>
            <button
              type="button"
              className="flex-1 cursor-pointer rounded-md border border-red-200 bg-transparent text-xs font-medium whitespace-nowrap text-red-600 hover:bg-red-50 sm:text-sm"
              onClick={() => onDelete?.(unit)}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
