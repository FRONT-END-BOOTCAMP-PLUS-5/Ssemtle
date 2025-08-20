'use client';

import { useEffect, useMemo, useState } from 'react';

// 단원 엔티티(프론트 최소 형태)
type UnitLite = { id: number; name: string };

export default function UnitTestPage() {
  // 선택된 카테고리들을 관리하는 상태(유닛 id 배열)
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  // 문제 개수를 관리하는 상태
  const [questionCount, setQuestionCount] = useState<number>(5);
  // 생성된 코드를 저장하는 상태
  const [generatedCode, setGeneratedCode] = useState<string>('');
  // 학생이 입력한 코드를 관리하는 상태
  const [studentCode, setStudentCode] = useState<string>('');
  // 검증으로 받은 문제 목록
  const [examQuestions, setExamQuestions] = useState<
    { id: number; question: string; helpText: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [userSolves, setUserSolves] = useState<
    {
      id: number;
      question: string;
      answer: string;
      userInput: string;
      isCorrect: boolean;
      createdAt: string;
    }[]
  >([]);
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 서버에서 불러온 단원 목록
  const [units, setUnits] = useState<UnitLite[]>([]);
  const [isUnitsLoading, setIsUnitsLoading] = useState<boolean>(true);
  const [unitsError, setUnitsError] = useState<string>('');

  // 초기 로드 시 단원 목록 불러오기
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await fetch('/api/unit', { method: 'GET' });
        if (!res.ok) throw new Error('단원 목록을 불러오지 못했습니다.');
        const data = await res.json();
        setUnits(Array.isArray(data.units) ? data.units : []);
      } catch (e) {
        console.error(e);
        setUnitsError('단원 목록을 불러오지 못했습니다.');
      } finally {
        setIsUnitsLoading(false);
      }
    };
    loadUnits();
  }, []);

  // 카테고리 선택/해제 함수 (unit id 기준)
  const handleUnitToggle = (unitId: number) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  // 선택된 유닛들의 이름 배열 메모
  const selectedUnitNames = useMemo(() => {
    const map = new Map<number, string>(units.map((u) => [u.id, u.name]));
    return selectedUnitIds.map((id) => map.get(id)!).filter(Boolean);
  }, [selectedUnitIds, units]);

  // 단원평가 코드 생성 함수
  const handleGenerateCode = async () => {
    // 유효성 검증
    if (selectedUnitIds.length === 0) {
      alert('최소 1개 이상의 카테고리를 선택해주세요.');
      return;
    }

    if (questionCount <= 0) {
      alert('문제 개수는 1개 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const selectedUnitsPayload = selectedUnitIds.map((id) => ({
        unitId: id,
        unitName: units.find((u) => u.id === id)?.name || '',
      }));

      // API 호출로 단원평가 코드 생성
      const response = await fetch('/api/unit-exam/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedUnits: selectedUnitsPayload,
          questionCount: questionCount,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedCode(data.code);
        alert(`단원평가 코드가 생성되었습니다: ${data.code}`);
      } else {
        alert('코드 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('코드 생성 오류:', error);
      alert('코드 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 학생이 입력한 코드 검증 함수
  const handleVerifyCode = async () => {
    if (!studentCode.trim()) {
      alert('코드를 입력해주세요.');
      return;
    }

    try {
      const code = studentCode.trim().toUpperCase();
      // 1) 코드 검증
      const verifyRes = await fetch('/api/unit-exam/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const verifyData = await verifyRes.json();
      if (!(verifyRes.ok && verifyData.valid)) {
        // 이미 응시한 내역: 검증 실패지만, 명확히 구분해 안내만 하고 종료
        if (verifyData?.alreadyAttempted) {
          alert('이미 응시한 내역입니다.');
          return;
        }
        alert('잘못된 코드입니다.');
        return;
      }

      // 2) 문제 조회
      const qRes = await fetch('/api/unit-exam/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const qData = await qRes.json();
      if (!qRes.ok || !qData?.questions || qData.questions.length === 0) {
        alert('문제를 불러오지 못했습니다.');
        return;
      }
      setExamQuestions(qData.questions);
      setCurrentIndex(0);
      setAnswers({});
    } catch (error) {
      console.error('코드 검증/문제 조회 오류:', error);
      alert('코드 검증/문제 조회 중 오류가 발생했습니다.');
    }
  };

  // 현재 문제에 대한 답 입력 핸들러
  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  };

  // 일괄 제출
  const handleSubmitAll = async () => {
    try {
      const code = studentCode.trim().toUpperCase();
      const payload = examQuestions.map((q) => ({
        questionId: q.id,
        userInput: answers[q.id] ?? '',
      }));

      const res = await fetch('/api/unit-exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, answers: payload }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`제출 완료 (${data.saved}개 저장)`);
      } else {
        alert(data?.error || '제출 실패');
      }
    } catch (error) {
      console.error('제출 오류:', error);
      alert('제출 중 오류가 발생했습니다.');
    }
  };

  // 내가 푼 문제 조회
  const handleLoadMySolves = async () => {
    try {
      const res = await fetch('/api/unit-exam/solves', { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        const items = (
          data.solves as {
            id: number;
            question: string;
            answer: string;
            userInput: string;
            isCorrect: boolean;
            createdAt: string;
          }[]
        ).map((s) => ({
          ...s,
          createdAt: new Date(s.createdAt).toLocaleString(),
        }));
        setUserSolves(items);
      } else {
        alert(data?.error || '조회 실패');
      }
    } catch (error) {
      console.error('조회 오류:', error);
      alert('조회 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-center text-3xl font-bold">
        단원평가 코드 생성
      </h1>

      {/* 카테고리 선택 섹션 */}
      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-semibold">카테고리 선택</h2>
        {isUnitsLoading ? (
          <div className="text-gray-600">단원 목록을 불러오는 중...</div>
        ) : unitsError ? (
          <div className="text-red-600">{unitsError}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => handleUnitToggle(unit.id)}
                  className={`rounded-lg border-2 p-3 transition-all duration-200 ${
                    selectedUnitIds.includes(unit.id)
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {unit.name}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              선택된 카테고리:{' '}
              {selectedUnitNames.length > 0
                ? selectedUnitNames.join(', ')
                : '없음'}
            </div>
          </>
        )}
      </div>

      {/* 문제 개수 설정 섹션 */}
      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-semibold">문제 개수 설정</h2>
        <div className="flex items-center gap-4">
          <label htmlFor="questionCount" className="text-gray-700">
            문제 개수:
          </label>
          <input
            id="questionCount"
            type="number"
            min="1"
            max="50"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
            className="w-20 rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <span className="text-gray-600">개</span>
        </div>
      </div>

      {/* 코드 생성 버튼 */}
      <div className="mb-8 text-center">
        <button
          onClick={handleGenerateCode}
          disabled={isLoading}
          className={`rounded-lg px-8 py-3 font-semibold text-white ${
            isLoading
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {isLoading ? '생성 중...' : '단원평가 코드 생성'}
        </button>
      </div>

      {/* 생성된 코드 표시 */}
      {generatedCode && (
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 text-lg font-semibold text-green-800">
            생성된 코드
          </h3>
          <div className="font-mono text-2xl font-bold text-green-700">
            {generatedCode}
          </div>
        </div>
      )}

      {/* 구분선 */}
      <hr className="my-8 border-gray-300" />

      {/* 학생용 코드 입력 섹션 */}
      <div className="rounded-lg bg-yellow-50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-yellow-800">
          학생용: 코드 입력
        </h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="단원평가 코드를 입력하세요 (예: ABCDEF)"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="flex-1 rounded border border-gray-300 p-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            maxLength={9}
          />
          <button
            onClick={handleVerifyCode}
            className="rounded-lg bg-yellow-600 px-6 py-3 text-white transition-colors duration-200 hover:bg-yellow-700"
          >
            코드 확인
          </button>
        </div>
        <div className="mt-2 text-sm text-yellow-700">
          * 영어 대문자 6글자로 된 코드를 입력하세요
        </div>
        <div className="mt-4">
          <button
            onClick={handleLoadMySolves}
            className="rounded-lg bg-gray-700 px-6 py-3 text-white transition-colors duration-200 hover:bg-gray-800"
          >
            내가 푼 문제 조회
          </button>
        </div>
      </div>

      {/* 문제 표시 섹션 (검증 성공 후 렌더링) */}
      {examQuestions.length > 0 && (
        <div className="mt-8 rounded border p-6">
          <div className="mb-4">
            문제 {currentIndex + 1} / {examQuestions.length}
          </div>
          <div className="mb-4 whitespace-pre-wrap">
            {examQuestions[currentIndex].question}
          </div>
          <input
            type="text"
            className="mb-2 w-full rounded border p-2"
            placeholder="정답을 입력하세요"
            value={answers[examQuestions[currentIndex].id] ?? ''}
            onChange={(e) =>
              handleAnswerChange(examQuestions[currentIndex].id, e.target.value)
            }
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded bg-gray-300 px-4 py-2"
            >
              이전
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === examQuestions.length - 1}
              className="rounded bg-gray-300 px-4 py-2"
            >
              다음
            </button>
            <button
              onClick={handleSubmitAll}
              className="ml-auto rounded bg-blue-600 px-4 py-2 text-white"
            >
              전체 제출
            </button>
          </div>
        </div>
      )}

      {/* 내가 푼 문제 목록 렌더링 */}
      {userSolves.length > 0 && (
        <div className="mt-8 rounded border p-6">
          <h3 className="mb-4 text-lg font-semibold">내가 푼 문제</h3>
          <div className="space-y-4">
            {userSolves.map((s) => (
              <div key={s.id} className="rounded border p-3">
                <div className="text-sm text-gray-600">
                  풀이일시: {s.createdAt}
                </div>
                <div className="font-medium whitespace-pre-wrap">
                  Q. {s.question}
                </div>
                <div className="mt-1">내 답: {s.userInput}</div>
                <div className="mt-1">정답: {s.answer}</div>
                <div
                  className={`mt-1 font-semibold ${s.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                >
                  {s.isCorrect ? '정답' : '오답'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
