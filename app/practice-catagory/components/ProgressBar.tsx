type ProgressBarProps = {
  /**
   * 진행률 퍼센트(0~100)
   */
  progress: number;
};

/**
 * 가로 진행률 막대 컴포넌트
 * - 접근성 속성(role, aria-*) 포함
 * - 서버 컴포넌트로 동작(상태/이펙트 없음)
 */
const ProgressBar = ({ progress }: ProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      <div
        className="h-3 w-full rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedProgress}
      >
        <div
          className="h-full rounded-full bg-blue-400 transition-all"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
