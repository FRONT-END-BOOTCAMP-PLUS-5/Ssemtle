'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGets } from '@/hooks/useGets';
import { GetUserInfoResponseDTO } from '@/backend/auth/dtos/UserDto';

/* ---------- API 응답 타입 ---------- */
type UsernameResp =
  | {
      success: true;
      user: { id: string; userId: string; name: string; role: string };
    }
  | { success: false; error: string };

type PasswordResp = { success: true } | { success: false; error: string };

/* ---------- 타입가드 & 에러 메시지 ---------- */
function isUsernameResp(x: unknown): x is UsernameResp {
  return typeof x === 'object' && x !== null && 'success' in x;
}
function isPasswordResp(x: unknown): x is PasswordResp {
  return typeof x === 'object' && x !== null && 'success' in x;
}
function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  try {
    return JSON.stringify(e);
  } catch {
    return '알 수 없는 오류가 발생했습니다.';
  }
}

export default function AccountPage() {
  // /mypage/[id] → 외부 userId
  const { id: userIdSlug } = useParams<{ id: string }>();

  const { data: userData, isLoading } = useGets<GetUserInfoResponseDTO>(
    ['user-info', userIdSlug],
    `/users/${userIdSlug}`,
    Boolean(userIdSlug)
  );

  // 내부 PK (API 호출에 사용)
  const internalId = userData?.id;
  const currentLoginId = userData?.userId ?? '';

  // --- 아이디 변경 상태 ---
  const [newUserId, setNewUserId] = useState('');
  const [isSavingId, setIsSavingId] = useState(false);
  const [idMsg, setIdMsg] = useState<string | null>(null);
  const [idErr, setIdErr] = useState<string | null>(null);

  // --- 비밀번호 변경 상태 ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  useEffect(() => {
    setIdMsg(null);
    setIdErr(null);
    setPwMsg(null);
    setPwErr(null);
  }, [internalId]);

  const canSubmitId = useMemo(
    () =>
      Boolean(internalId) &&
      newUserId.trim().length > 0 &&
      newUserId !== currentLoginId,
    [internalId, newUserId, currentLoginId]
  );

  const canSubmitPw = useMemo(
    () =>
      Boolean(internalId) &&
      currentPassword.length > 0 &&
      newPassword.length >= 6 &&
      newPassword === newPassword2,
    [internalId, currentPassword, newPassword, newPassword2]
  );

  const handleChangeUsername = async () => {
    if (!internalId) return;
    setIsSavingId(true);
    setIdMsg(null);
    setIdErr(null);
    try {
      const res = await fetch(`/api/users/${internalId}/username`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUserId: newUserId.trim() }),
      });

      const raw: unknown = await res.json();
      if (!isUsernameResp(raw)) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }
      if (!res.ok || raw.success === false) {
        const msg =
          raw.success === false && 'error' in raw
            ? raw.error
            : '아이디 변경에 실패했습니다.';
        throw new Error(msg);
      }

      setIdMsg('아이디가 변경되었습니다.');
    } catch (e: unknown) {
      setIdErr(getErrorMessage(e) || '아이디 변경 중 오류가 발생했습니다.');
    } finally {
      setIsSavingId(false);
    }
  };

  const handleChangePassword = async () => {
    if (!internalId) return;
    setIsSavingPw(true);
    setPwMsg(null);
    setPwErr(null);
    try {
      const res = await fetch(`/api/users/${internalId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const raw: unknown = await res.json();
      if (!isPasswordResp(raw)) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }
      if (!res.ok || raw.success === false) {
        const msg =
          raw.success === false && 'error' in raw
            ? raw.error
            : '비밀번호 변경에 실패했습니다.';
        throw new Error(msg);
      }

      setPwMsg('비밀번호가 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPassword2('');
    } catch (e: unknown) {
      setPwErr(getErrorMessage(e) || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsSavingPw(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] w-full bg-[#f6f7fb]">
      <div className="mx-auto w-full max-w-xl px-4 py-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">계정 설정</h1>
        {isLoading && <div className="mt-4 text-gray-500">불러오는 중…</div>}
        {!isLoading && (
          <>
            {/* 아이디(로그인 ID) 변경 */}
            <section className="mt-6 rounded-2xl bg-white p-5 shadow">
              <h2 className="text-lg font-semibold">아이디 변경</h2>
              <p className="mt-1 text-sm text-gray-500">
                현재 아이디:{' '}
                <span className="font-mono">{currentLoginId || '-'}</span>
              </p>

              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  새 아이디
                  <input
                    type="text"
                    value={newUserId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewUserId(e.target.value)
                    }
                    placeholder="새 아이디를 입력"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleChangeUsername}
                    disabled={!canSubmitId || isSavingId}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {isSavingId ? '변경 중…' : '아이디 변경'}
                  </button>
                  {idMsg && (
                    <span className="text-sm text-green-600">{idMsg}</span>
                  )}
                  {idErr && (
                    <span className="text-sm text-red-600">{idErr}</span>
                  )}
                </div>
              </div>
            </section>

            {/* 비밀번호 변경 */}
            <section className="mt-6 rounded-2xl bg-white p-5 shadow">
              <h2 className="text-lg font-semibold">비밀번호 변경</h2>
              <div className="mt-4 grid gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  현재 비밀번호
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="현재 비밀번호"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  새 비밀번호 (6자 이상)
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="새 비밀번호"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  새 비밀번호 확인
                  <input
                    type="password"
                    value={newPassword2}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPassword2(e.target.value)
                    }
                    placeholder="새 비밀번호 확인"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={!canSubmitPw || isSavingPw}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {isSavingPw ? '변경 중…' : '비밀번호 변경'}
                  </button>
                  {pwMsg && (
                    <span className="text-sm text-green-600">{pwMsg}</span>
                  )}
                  {pwErr && (
                    <span className="text-sm text-red-600">{pwErr}</span>
                  )}
                </div>

                {/* 유효성 보조 문구 */}
                {!isSavingPw &&
                  newPassword !== '' &&
                  newPassword.length < 6 && (
                    <p className="text-xs text-red-600">
                      새 비밀번호는 6자리 이상이어야 합니다.
                    </p>
                  )}
                {!isSavingPw &&
                  newPassword !== '' &&
                  newPassword2 !== '' &&
                  newPassword !== newPassword2 && (
                    <p className="text-xs text-red-600">
                      새 비밀번호가 일치하지 않습니다.
                    </p>
                  )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
