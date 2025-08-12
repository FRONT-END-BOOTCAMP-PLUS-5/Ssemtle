'use client';

import { SolveListItemDto } from '@/backend/solves/dtos/SolveDto';

interface TestCardProps {
  solves: SolveListItemDto[];
  category: string;
}

export default function TestCard({ solves, category }: TestCardProps) {
  if (!solves?.length) {
    return (
      <div className="inline-flex w-[400px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white/90 p-4 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px]">
        <div className="text-sm text-gray-600">데이터가 없습니다</div>
      </div>
    );
  }
  const totalProblems = solves.length;
  const correctProblems = solves.filter((solve) => solve.isCorrect).length;
  const accuracy =
    totalProblems > 0 ? Math.round((correctProblems / totalProblems) * 100) : 0;

  // Get first 3 questions for display
  const sampleQuestions = solves.slice(0, 3);

  // Format the latest date
  const latestDate = solves[0]?.createdAt
    ? new Date(solves[0].createdAt)
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\./g, '.')
        .replace(/\s/g, '')
    : '';

  return (
    <div
      data-layer="Overlay+Shadow+OverlayBlur"
      className="OverlayShadowOverlayblur inline-flex w-[400px] flex-col items-start justify-start gap-3 overflow-hidden rounded-2xl bg-white/90 p-4 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px]"
    >
      <div
        data-layer="Container"
        className="Container relative h-12 self-stretch"
      >
        <div
          data-layer={`${totalProblems} 문제`}
          className="absolute top-[30px] left-[339px] justify-center font-['Inter'] text-[13px] leading-7 font-normal text-black"
        >
          {totalProblems} 문제
        </div>
        <div
          data-layer="Container"
          className="Container absolute top-0 left-[0.50px] h-12 w-[397px]"
        >
          <div
            data-layer="Container"
            className="Container absolute top-[-2px] left-[-0.50px] inline-flex h-[53px] w-[397px] flex-col items-start justify-start"
          >
            <div
              data-layer="Heading 3"
              className="Heading3 relative h-7 self-stretch"
            >
              <div
                data-layer={category}
                className="absolute top-0 left-0 h-14 w-[397px] justify-center font-['Inter'] text-lg leading-7 font-bold text-gray-800"
              >
                {category}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        data-layer="Container"
        className="Container flex flex-col items-start justify-start gap-2 self-stretch pt-1"
      >
        {sampleQuestions.map((solve) => (
          <div
            key={solve.id}
            data-layer="Background"
            className="Background inline-flex items-center justify-between self-stretch rounded-sm bg-gray-50 p-2"
          >
            <div
              data-layer="Container"
              className="Container size- inline-flex flex-col items-start justify-start"
            >
              <div
                data-layer={solve.question}
                className="justify-center font-['Inter'] text-sm leading-tight font-normal text-gray-700"
              >
                {solve.question}
              </div>
            </div>
            <div data-layer="Container" className="Container h-4 w-5" />
          </div>
        ))}
      </div>

      <div
        data-layer="Container"
        className="Container flex flex-col items-start justify-start gap-1 self-stretch pt-1"
      >
        <div
          data-layer="Container"
          className="Container inline-flex items-start justify-between self-stretch"
        >
          <div
            data-layer="Container"
            className="Container inline-flex flex-col items-start justify-start self-stretch"
          >
            <div
              data-layer="정답률"
              className="justify-center font-['Inter'] text-sm leading-tight font-normal text-gray-600"
            >
              정답률
            </div>
          </div>
          <div
            data-layer="Container"
            className="Container inline-flex flex-col items-start justify-start self-stretch"
          >
            <div
              data-layer={`${accuracy}%`}
              className="justify-center font-['Inter'] text-sm leading-tight font-normal text-gray-600"
            >
              {accuracy}%
            </div>
          </div>
        </div>
        <div
          data-layer="Background"
          className="Background flex h-2 flex-col items-start justify-center self-stretch rounded-[58px] bg-gray-200"
        >
          <div
            data-layer="Background"
            className="Background flex-1 bg-green-400"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

      <div data-layer="Container" className="Container relative h-5 w-[71px]">
        <div
          data-layer="Container"
          className="Container size- absolute top-0 left-0 inline-flex items-center justify-start gap-1"
        >
          <div
            data-layer={latestDate}
            className="justify-center font-['Inter'] text-sm leading-tight font-normal text-gray-600"
          >
            {latestDate}
          </div>
          <div data-layer="SVG" className="Svg relative size-4" />
        </div>
      </div>
    </div>
  );
}
