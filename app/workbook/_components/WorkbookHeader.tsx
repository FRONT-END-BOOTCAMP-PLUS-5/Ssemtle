'use client';

import { useRouter } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';

interface WorkbookHeaderProps {
  title: string;
}

export default function WorkbookHeader({ title }: WorkbookHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center justify-between">
      <button
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-200"
      >
        <IoChevronBack className="h-6 w-6 text-gray-700" />
      </button>

      <h1 className="text-lg font-bold text-gray-800">{title}</h1>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
        <div className="h-6 w-6 rounded-full bg-purple-300"></div>
      </div>
    </div>
  );
}
