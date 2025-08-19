'use client';

import ExportButton from './ExportButton';

interface ActionButtonsProps {
  onBulkRegister: () => void;
  onRegister: () => void;
}

export default function ActionButtons({
  onBulkRegister,
  onRegister,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        onClick={onBulkRegister}
        className="h-10 w-full rounded bg-indigo-400 text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500 sm:w-40"
      >
        학생 일괄 등록
      </button>
      <button
        onClick={onRegister}
        className="h-10 w-full rounded bg-indigo-400 text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500 sm:w-40"
      >
        학생 등록
      </button>
      <ExportButton />
    </div>
  );
}
