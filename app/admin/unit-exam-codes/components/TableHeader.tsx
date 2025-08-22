export default function TableHeader() {
  // 단원평가 코드 목록의 테이블 헤더 렌더링
  return (
    <div className="grid grid-cols-6 border-b-2 border-neutral-200/70 bg-violet-50">
      <div className="px-6 py-3 text-left">
        <span className="text-xs font-bold text-neutral-700">코드</span>
      </div>
      <div className="px-6 py-3 text-left">
        <span className="text-xs font-bold text-neutral-700">문항수</span>
      </div>
      <div className="px-6 py-3 text-left">
        <span className="text-xs font-bold text-neutral-700">카테고리</span>
      </div>
      <div className="px-6 py-3 text-left">
        <span className="text-xs font-bold text-neutral-700">시험시간</span>
      </div>
      <div className="px-6 py-3 text-left">
        <span className="text-xs font-bold text-neutral-700">시험지</span>
      </div>
      <div className="px-6 py-3 text-left">
        <span className="text-xs font-bold text-neutral-700">생성일</span>
      </div>
    </div>
  );
}
