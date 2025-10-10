'use client';

import { useMemo, useState } from 'react';
import Pagination from '@/app/_components/pagination/Pagination';
import SearchInput from '@/app/teacher/student/components/SearchInput';
import TableHeader from './components/TableHeader';
import UnitExamCodeTable from './components/UnitExamCodeTable';
import ProblemsModal from '@/app/teacher/unit-exam-codes/components/ProblemsModal';
import CreateUnitExamModal from './components/CreateUnitExamModal';
import { useGets } from '@/hooks/useGets';
import { useDeletes } from '@/hooks/useDeletes';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { confirmToast } from '@/utils/toast/confirmToast';

interface UnitExamListResponse {
  success: boolean;
  data: {
    unitExams: Array<{
      code: string;
      categories: string[];
      createdAt: string;
      problemCount: number;
      timerMinutes?: number | null;
    }>;
    total: number;
  };
}

export default function UnitExamCodesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProblemsOpen, setIsProblemsOpen] = useState(false);
  const [problemsForCode, setProblemsForCode] = useState<string>('');

  const { data, isLoading, isError, refetch } = useGets<UnitExamListResponse>(
    ['admin-unit-exam-codes'],
    '/admin/unit-exam-codes',
    true,
    undefined,
    undefined,
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );

  const rows = useMemo(() => {
    const list = data?.data?.unitExams ?? [];
    return list.map((r, idx) => ({
      id: String(idx + 1),
      code: r.code,
      category: r.categories.join(', '),
      problemCount: r.problemCount,
      timerMinutes: r.timerMinutes ?? null,
      createdAt:
        r.createdAt?.toString()?.slice(0, 10)?.replace(/-/g, '.') ?? '',
    }));
  }, [data?.data?.unitExams]);

  const filteredCodes = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    return rows.filter((item) =>
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  // 간단한 페이지네이션 (학생 페이지와 동일한 UX를 위해 7개 고정)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCodes.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredCodes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleOpenCreate = () => setIsCreateOpen(true);
  const handleCloseCreate = () => setIsCreateOpen(false);
  const handleCreate = () => {
    // 모달 내에서 실제 생성 및 알림 처리 완료됨 → 여기서는 목록 갱신만 수행
    setIsCreateOpen(false);
    refetch();
  };

  // 삭제 훅 설정
  type DeleteResponse = { success: boolean; error?: string };
  const { mutateAsync: deleteCode } = useDeletes<unknown, DeleteResponse>({
    onSuccess: (resp) => {
      if (!resp?.success) {
        toast.error(resp?.error || '삭제에 실패했습니다.');
        return;
      }
      refetch();
    },
    onError: (e) => {
      console.error('[delete unit-exam-code] error:', e);
      const err = e as AxiosError<DeleteResponse>;
      const status = err.response?.status;
      const message = err.response?.data?.error;

      if (
        status === 400 &&
        message &&
        (message.includes('이미 응시') || message.includes('응시 기록'))
      ) {
        toast.info(
          '이미 응시한 시험지는 삭제할 수 없습니다. 배부된 시험지는 삭제가 불가능합니다.'
        );
        return;
      }
      if (status === 403) {
        toast.warn('삭제 권한이 없습니다.');
        return;
      }
      if (status === 401) {
        toast.warn('로그인이 필요합니다.');
        return;
      }
      toast.error(message || '삭제가 불가능합니다. 잠시 후 다시 시도해주세요.');
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF]">
      <div className="w-full px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-[1200px] lg:px-8 lg:py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-500">
            단원평가
          </h1>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:justify-between">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="카테고리 검색"
          />
          <button
            onClick={handleOpenCreate}
            className="h-[32px] rounded-[10px] bg-violet-500 px-4 text-sm font-semibold text-white shadow hover:bg-violet-600 sm:h-10 sm:px-6 sm:text-base"
          >
            단원평가 생성
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="hidden lg:block">
            <TableHeader />
            {isLoading ? (
              <div className="py-10 text-center text-sm text-neutral-500">
                불러오는 중...
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-sm text-rose-500">
                목록 조회 실패
              </div>
            ) : (
              <UnitExamCodeTable
                items={currentData}
                onDelete={async (code: string) => {
                  const ok = await confirmToast(
                    '정말 이 단원평가 코드를 삭제하시겠습니까?\n코드와 해당 문제들이 모두 삭제됩니다.',
                    { confirmText: '삭제', cancelText: '취소' }
                  );
                  if (!ok) return;
                  await deleteCode({ path: `/admin/unit-exam-codes/${code}` });
                }}
                onOpenProblems={(code: string) => {
                  setProblemsForCode(code);
                  setIsProblemsOpen(true);
                }}
              />
            )}

            {totalPages > 1 && (
              <div className="py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-4"
                />
              </div>
            )}
          </div>

          <div className="lg:hidden">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-neutral-500">
                불러오는 중...
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-sm text-rose-500">
                목록 조회 실패
              </div>
            ) : (
              <UnitExamCodeTable
                items={currentData}
                onDelete={async (code: string) => {
                  const ok = await confirmToast(
                    '정말 이 단원평가 코드를 삭제하시겠습니까?\n코드와 해당 문제들이 모두 삭제됩니다.',
                    { confirmText: '삭제', cancelText: '취소' }
                  );
                  if (!ok) return;
                  await deleteCode({ path: `/admin/unit-exam-codes/${code}` });
                }}
                onOpenProblems={(code: string) => {
                  setProblemsForCode(code);
                  setIsProblemsOpen(true);
                }}
              />
            )}

            {totalPages > 1 && (
              <div className="py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-4"
                  maxVisiblePages={4}
                  showFirstLast={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateUnitExamModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        onCreate={handleCreate}
      />
      <ProblemsModal
        isOpen={isProblemsOpen}
        code={problemsForCode}
        onClose={() => setIsProblemsOpen(false)}
      />
    </div>
  );
}
