'use client';

interface ProblemDisplayProps {
  title: string;
  instruction: string;
  equation: string;
}

export default function ProblemDisplay({
  title,
  instruction,
  equation,
}: ProblemDisplayProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
        {/* Problem Title */}
        <div className="text-center">
          <h1 className="font-['Inter'] text-2xl font-bold text-gray-800">
            {title}
          </h1>
        </div>

        {/* Instruction Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="font-['Inter'] text-lg font-bold text-gray-800">
              {instruction}
            </p>
          </div>
        </div>

        {/* Equation Card */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-violet-100 p-6 shadow-sm">
          <div className="text-center">
            <p className="font-['Inter'] text-lg font-bold text-gray-800">
              {equation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
