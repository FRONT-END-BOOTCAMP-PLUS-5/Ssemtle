'use client';

import { useMemo, useState } from 'react';

type Props = {
  /** Prisma users PK (내부 id) */
  internalId: string;
  /** 현재 로그인 아이디(외부 userId) 표시용 */
  currentUserId: string;
  /** (선택) 모달 닫기 콜백 */
  onClose?: () => void;
};

type UsernameResp =
  | {
      success: true;
      user: { id: string; userId: string; name: string; role: string };
    }
  | { success: false; error: string };

type PasswordResp = { success: true } | { success: false; error: string };

// --- 타입가드 ---
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

export default function AccountSettingsCard({
  internalId,
  currentUserId,
  onClose,
}: Props) {
  // --- 아이디 변경 ---
  const [newUserId, setNewUserId] = useState('');
  const [isSavingId, setIsSavingId] = useState(false);
  const [idMsg, setIdMsg] = useState<string | null>(null);
  const [idErr, setIdErr] = useState<string | null>(null);

  // --- 비밀번호 변경 ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const canSubmitId = useMemo(
    () =>
      Boolean(internalId) &&
      Boolean(newUserId.trim()) &&
      newUserId.trim() !== currentUserId,
    [internalId, newUserId, currentUserId]
  );

  const canSubmitPw = useMemo(
    () =>
      Boolean(internalId) &&
      Boolean(currentPassword) &&
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
          currentPassword,
          newPassword,
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
    <div className="rounded-2xl bg-white shadow-lg outline outline-gray-200">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="text-base font-semibold">계정 설정</div>
        {onClose && (
          <button
            className="rounded-md px-2 py-1 text-sm hover:bg-gray-100"
            onClick={onClose}
          >
            닫기 ✕
          </button>
        )}
      </div>

      {/* 아이디 변경 */}
      <div className="p-5">
        <h2 className="text-lg font-semibold">아이디 변경</h2>
        <p className="mt-1 text-sm text-gray-500">
          현재 아이디: <span className="font-mono">{currentUserId || '-'}</span>
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
            {idMsg && <span className="text-sm text-green-600">{idMsg}</span>}
            {idErr && <span className="text-sm text-red-600">{idErr}</span>}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gray-100" />

      {/* 비밀번호 변경 */}
      <div className="p-5">
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
            {pwMsg && <span className="text-sm text-green-600">{pwMsg}</span>}
            {pwErr && <span className="text-sm text-red-600">{pwErr}</span>}
          </div>

          {!isSavingPw && newPassword && newPassword.length < 6 && (
            <p className="text-xs text-red-600">
              새 비밀번호는 6자리 이상이어야 합니다.
            </p>
          )}
          {!isSavingPw &&
            newPassword &&
            newPassword2 &&
            newPassword !== newPassword2 && (
              <p className="text-xs text-red-600">
                새 비밀번호가 일치하지 않습니다.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
