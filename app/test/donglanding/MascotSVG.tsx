'use client';
import React from 'react';

export type MascotState =
  | 'idle' // 기본: 숨쉬기 + 깜빡임
  | 'thinking' // 시선 굴리기(고민)
  | 'correct' // 가볍게 점프
  | 'celebrate' // 팝/스핀 축하
  | 'wrong' // 좌우 쉐이크
  | 'sleep'; // Zzz

export default function MascotSVG({
  state = 'idle',
  size = 208,
  label = 'Ssemtle Mascot',
}: {
  state?: MascotState;
  size?: number;
  label?: string;
}) {
  const wrapperClass =
    state === 'celebrate'
      ? 'anim-celebrate'
      : state === 'wrong'
        ? 'anim-shake'
        : state === 'correct'
          ? 'anim-hop'
          : state === 'idle'
            ? 'anim-breathe'
            : '';

  const pupilClass = state === 'thinking' ? 'anim-glance' : 'anim-blink';
  const rightArmClass = state === 'celebrate' ? 'anim-wave' : '';

  // 입 모양 (간단한 아크)
  const mouthD =
    state === 'wrong'
      ? 'M80,130 C95,120 105,120 120,130' // 살짝 찡그림
      : 'M80,132 C95,140 105,140 120,132'; // 미소

  return (
    <div style={{ width: size, height: size }} className="select-none">
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        role="img"
        aria-label={label}
      >
        {/* 그림자 */}
        <ellipse
          cx="100"
          cy="178"
          rx="28"
          ry="8"
          className={`shadow ${state === 'correct' || state === 'celebrate' ? 'shadow-small' : ''}`}
          fill="rgba(16,24,40,0.15)"
        />
        {/* 몸통 */}
        <g className={wrapperClass}>
          <rect
            x="30"
            y="30"
            width="140"
            height="140"
            rx="28"
            fill="#34d399"
            stroke="#10b981"
            strokeWidth="6"
          />
          {/* 귀 */}
          <rect
            x="46"
            y="18"
            width="22"
            height="22"
            rx="8"
            fill="#10b981"
            transform="rotate(12 57 29)"
          />
          <rect
            x="132"
            y="18"
            width="22"
            height="22"
            rx="8"
            fill="#10b981"
            transform="rotate(-12 143 29)"
          />
          {/* 팔 */}
          <rect x="36" y="82" width="28" height="28" rx="10" fill="#10b981" />
          <rect
            x="136"
            y="82"
            width="28"
            height="28"
            rx="10"
            fill="#10b981"
            className={rightArmClass}
            style={{ transformOrigin: '150px 82px' }}
          />
          {/* 눈 */}
          <g transform="translate(0,0)">
            <g className="eye" transform="translate(70,90)">
              <circle
                cx="0"
                cy="0"
                r="15"
                fill="#fff"
                stroke="#065f46"
                strokeWidth="3"
              />
              <circle
                cx="0"
                cy="0"
                r="6"
                fill="#064e3b"
                className={pupilClass}
              />
            </g>
            <g className="eye" transform="translate(130,90)">
              <circle
                cx="0"
                cy="0"
                r="15"
                fill="#fff"
                stroke="#065f46"
                strokeWidth="3"
              />
              <circle
                cx="0"
                cy="0"
                r="6"
                fill="#064e3b"
                className={pupilClass}
              />
            </g>
          </g>
          {/* 입 */}
          <path
            d={mouthD}
            stroke={state === 'wrong' ? '#7f1d1d' : '#064e3b'}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Sleep: Zzz */}
        {state === 'sleep' && (
          <g fontFamily="ui-sans-serif, system-ui" fill="#0f172a">
            <text x="150" y="50" fontSize="14" opacity="0" className="anim-zz">
              z
            </text>
            <text
              x="160"
              y="38"
              fontSize="16"
              opacity="0"
              className="anim-zz"
              style={{ animationDelay: '180ms' }}
            >
              z
            </text>
            <text
              x="170"
              y="26"
              fontSize="20"
              opacity="0"
              className="anim-zz"
              style={{ animationDelay: '360ms' }}
            >
              Z
            </text>
          </g>
        )}
      </svg>

      {/* 컴포넌트 스코프 스타일 */}
      <style jsx>{`
        /* 기본 모션 */
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
        @keyframes blink {
          0%,
          92%,
          100% {
            transform: scaleY(1);
          }
          96% {
            transform: scaleY(0.1);
          }
        }
        @keyframes glance {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(4px);
          }
        }
        @keyframes hop {
          0% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-18px);
          }
          60% {
            transform: translateY(0);
          }
          80% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-10px);
          }
          40% {
            transform: translateX(10px);
          }
          60% {
            transform: translateX(-8px);
          }
          80% {
            transform: translateX(8px);
          }
        }
        @keyframes spinPop {
          0% {
            transform: translateY(-8px) rotate(0deg) scale(0.9);
          }
          50% {
            transform: translateY(-24px) rotate(12deg) scale(1.05);
          }
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
        }
        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(18deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes zzz {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translate(-6px, -18px) scale(1.05);
          }
        }

        .anim-breathe {
          animation: breathe 2.2s ease-in-out infinite;
        }
        .anim-blink {
          animation: blink 3.4s ease-in-out infinite;
          transform-origin: center;
        }
        .anim-glance {
          animation: glance 2.2s ease-in-out infinite;
        }
        .anim-hop {
          animation: hop 700ms ease-out both;
        }
        .anim-shake {
          animation: shake 620ms ease-in-out both;
        }
        .anim-celebrate {
          animation: spinPop 1.1s ease-out both;
        }
        .anim-wave {
          animation: wave 900ms ease-in-out infinite;
          transform-origin: 150px 82px;
        }
        .anim-zz {
          animation: zzz 900ms ease-out forwards;
        }

        .shadow {
          transition:
            transform 300ms ease,
            opacity 300ms ease;
        }
        .shadow-small {
          transform: scaleX(0.8) scaleY(0.8);
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
