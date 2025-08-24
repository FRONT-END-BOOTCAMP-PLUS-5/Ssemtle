'use client';

interface WorkbookHeaderProps {
  title: string;
  description: string;
}

export default function WorkbookHeader({
  title,
  description,
}: WorkbookHeaderProps) {
  return (
    <div className="mb-6 flex flex-row">
      <div className="w-full px-6 pt-8 sm:px-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        </div>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">{description}</p>
      </div>
    </div>
  );
}
