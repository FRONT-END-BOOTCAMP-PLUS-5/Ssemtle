/**
 * ProblemSolvingSphere (Tailwind 기반)
 * - 배경 텍스트 + 좌→우 구(볼) 이동 무한 반복
 * - 줄무늬(굴절) 제거, 글로우/재질은 그라디언트와 그림자로 표현
 */
export function ProblemSolvingSphere() {
  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#EDE9FE]"
      aria-label="Problem Solving Animation"
    >
      {/* 배경 텍스트: PROBLEM SOLVING (고정 표시) */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-[clamp(48px,12vw,180px)] leading-[0.9] font-extrabold tracking-[2px] text-gray-900 select-none"
        aria-hidden
      >
        <div>
          <div>PROBLEM</div>
          <div>SOLVING</div>
        </div>
      </div>

      {/* 구(볼) */}
      <div
        className="absolute top-[64%] left-[-30vw] z-[2] h-[clamp(100px,25vw,280px)] w-[clamp(100px,25vw,280px)] -translate-y-1/2 animate-[roll_4s_linear_infinite] max-[1024px]:top-[50%] max-[500px]:top-[55%]"
        aria-hidden
      >
        <div
          className="relative h-full w-full rounded-full"
          style={{
            background:
              'radial-gradient(120px 120px at 40% 40%, rgba(180,220,255,0.85), rgba(30,80,120,0.9) 60%, rgba(0,0,0,0.9))',
            boxShadow:
              'inset 0 0 50px rgba(0,0,0,0.6), inset 20px 10px 60px rgba(255,255,255,0.2)',
          }}
        >
          {/* 글로우 */}
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_18px_rgba(120,200,255,0.8)_inset,0_0_48px_rgba(80,160,255,0.4)_inset]" />

          {/* 약한 자체 회전 */}
          <div className="pointer-events-none absolute inset-0 animate-[spin_1.6s_linear_infinite] rounded-full opacity-0" />
        </div>
      </div>

      {/* 키프레임 정의 (전역 적용) */}
      <style>{`
        @keyframes roll { 0% { left: -30vw; transform: translateY(-50%) rotate(0deg);} 100% { left: calc(100% + 30vw); transform: translateY(-50%) rotate(900deg);} }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes spinText { from { transform: rotate(0deg);} to { transform: rotate(-360deg);} }
      `}</style>
    </div>
  );
}
