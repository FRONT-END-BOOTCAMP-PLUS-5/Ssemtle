export default function TableHeader() {
  return (
    <div className="grid grid-cols-5 border-b-2 border-neutral-200/70 bg-violet-50">
      <div className="px-6 py-3 text-left">
        <span className="text-xs font-bold text-neutral-700">이름</span>
      </div>
      <div className="px-6 py-3 text-left">
        <span className="text-xs font-bold text-neutral-700">아이디</span>
      </div>
      <div className="px-6 py-3 text-left"></div>
      <div className="px-6 py-3 text-left"></div>
      <div className="px-6 py-3 text-center"></div>
    </div>
  );
}
