'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

interface FormModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isBusy?: boolean;
  children: ReactNode;
}

export default function FormModal({
  isOpen,
  title,
  onClose,
  isBusy = false,
  children,
}: FormModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={isBusy ? undefined : onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative h-96 w-96">
          <div className="absolute top-6 left-0 inline-flex w-96 flex-col gap-3 rounded-lg bg-white px-4 pt-2 pb-4">
            <div className="flex w-full flex-col gap-1 border-b border-gray-200 pb-2">
              <div className="inline-flex w-full items-center justify-center gap-3 py-1">
                <div className="flex flex-1 flex-col">
                  <div className="w-full pl-2 text-start text-lg leading-normal font-medium text-gray-900">
                    {title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  aria-label="닫기"
                  className="inline-flex items-center justify-center"
                >
                  <Image
                    src="/icons/close-circle.svg"
                    alt="닫기"
                    width={32}
                    height={32}
                    priority
                  />
                </button>
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </>
  );
}
