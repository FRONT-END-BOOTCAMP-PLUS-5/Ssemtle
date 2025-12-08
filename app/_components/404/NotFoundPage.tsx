'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFoundPage(): React.ReactElement {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <picture>
        <source srcSet="/icons/404-24.avif" type="image/avif" />
        <source srcSet="/icons/404-24.webp" type="image/webp" />
        <Image
          src="/icons/404-24.png"
          alt="404 이미지"
          width={800}
          height={800}
          className="max-h-full max-w-full object-contain"
          priority
        />
      </picture>

      <Link href="/" className="group relative h-14 w-52">
        <div className="absolute top-0 left-0 h-14 w-52 rounded-[30px] bg-purple-200 shadow-[inset_0px_0px_0px_7px_rgba(255,255,255,1.00)] outline outline-[3px] outline-black transition-all duration-300 group-hover:bg-purple-300" />
        <button className="absolute top-[14px] left-[69px] cursor-pointer justify-start font-['Helvetica'] text-2xl font-normal text-black capitalize">
          메인으로
        </button>
        <div className="absolute top-[10px] left-[26px] h-9 w-9 overflow-hidden">
          <Image
            src="/icons/Arrow.svg"
            alt="Arrow icon"
            width={36}
            height={36}
            className="h-full w-full"
          />
        </div>
      </Link>
    </div>
  );
}
