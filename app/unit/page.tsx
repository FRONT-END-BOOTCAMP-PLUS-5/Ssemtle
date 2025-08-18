'use client';

import { useState } from 'react';

const UnitPage = () => {
  const [unitCode, setUnitCode] = useState('');

  const onChangeUnitCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnitCode(e.target.value);
  };

  const onClickUnitExam = () => {};

  return (
    <div className="border-black-100 flex w-screen flex-col">
      <span className="flex w-full p-8 text-2xl font-bold">단원 평가</span>
      <div className="flex h-full w-full flex-1 justify-center pt-10">
        <div className="flex h-100 w-200 flex-col items-center justify-center rounded-2xl border-2 border-[var(--color-sidebar-button)] max-[431px]:w-[80%] max-[431px]:origin-top">
          <div>
            <button
              className="h-15 w-50 rounded-2xl border-1 border-[var(--color-sidebar-icon)] shadow-md transition hover:translate-y-[-3px] hover:shadow-xl"
              onClick={onClickUnitExam}
            >
              단원평가 시작
            </button>
          </div>
          <div>
            <input
              type="text"
              value={unitCode}
              onChange={onChangeUnitCode}
              placeholder="단원 평가 코드를 입력해주세요."
              className="mt-15 h-15 w-100 rounded-2xl border-1 border-[var(--color-sidebar-icon)] text-center max-[431px]:w-70"
            ></input>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitPage;
