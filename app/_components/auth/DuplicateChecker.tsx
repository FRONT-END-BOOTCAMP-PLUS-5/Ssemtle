'use client';

import { useState, useEffect } from 'react';
import { checkDuplicate } from '@/libs/api/auth';

interface DuplicateCheckerProps {
  userId: string;
  onCheck: (exists: boolean) => void;
  disabled?: boolean;
}

export default function DuplicateChecker({
  userId,
  onCheck,
  disabled,
}: DuplicateCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'available' | 'taken' | 'error'
  >('idle');

  useEffect(() => {
    if (!userId || userId.length < 3 || disabled) {
      setMessage('');
      setStatus('idle');
      onCheck(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        const result = await checkDuplicate(userId);
        if (result.exists) {
          setMessage('이미 사용 중인 아이디입니다');
          setStatus('taken');
          onCheck(false);
        } else {
          setMessage('사용 가능한 아이디입니다');
          setStatus('available');
          onCheck(true);
        }
      } catch {
        setMessage('중복 확인 중 오류가 발생했습니다');
        setStatus('error');
        onCheck(false);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userId, onCheck, disabled]);

  if (!message && !isChecking) return null;

  const getMessageColor = () => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'taken':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="mt-1 flex items-center gap-2">
      {isChecking && (
        <div className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent" />
      )}
      <p className={`text-xs ${getMessageColor()}`}>
        {isChecking ? '확인 중...' : message}
      </p>
    </div>
  );
}
