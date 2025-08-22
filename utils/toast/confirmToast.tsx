import React from 'react';
import { toast, ToastOptions } from 'react-toastify';

/**
 * 토스트 기반 확인 다이얼로그
 * - 확인/취소 버튼이 있는 토스트를 띄우고 Promise<boolean>을 반환합니다.
 */
export function confirmToast(
  message: string,
  options?: {
    confirmText?: string;
    cancelText?: string;
    toastOptions?: ToastOptions;
  }
): Promise<boolean> {
  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="text-sm whitespace-pre-line">{message}</div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resolve(false);
                t.closeToast?.();
              }}
              className="rounded border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {options?.cancelText ?? '취소'}
            </button>
            <button
              type="button"
              onClick={() => {
                resolve(true);
                t.closeToast?.();
              }}
              className="rounded bg-rose-600 px-3 py-1 text-sm text-white hover:bg-rose-700"
            >
              {options?.confirmText ?? '확인'}
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        ...options?.toastOptions,
      }
    );
  });
}
