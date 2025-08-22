'use client';
import React from 'react';

export type MascotState =
  | 'idle' // 기본: 숨쉬기 + 깜빡임
  | 'thinking' // 시선 굴리기(고민)
  | 'correct' // 가볍게 점프
  | 'celebrate' // 팝/스핀 축하
  | 'wrong' // 좌우 쉐이크
  | 'sleep'; // Zzz

type Skin = 'bunny' | 'owl' | 'robot' | 'pencil';

export default function MascotSVG({
  state = 'idle',
  skin = 'bunny',
  size = 208,
  label = 'Ssemtle Mascot',
}: {
  state?: MascotState;
  skin?: Skin;
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
  const mouthD =
    state === 'wrong'
      ? 'M80,132 C95,122 105,122 120,132'
      : 'M78,134 C95,142 105,142 122,134';

  const config = getSkinConfig(skin);

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

        {/* 몸통/장식 */}
        <g className={wrapperClass}>
          {config.body}
          {config.ears}
          {config.arms}
          {/* 눈 */}
          <g transform="translate(0,0)">
            <g transform="translate(70,90)">
              <circle
                cx="0"
                cy="0"
                r="15"
                fill="#fff"
                stroke={config.eyeStroke}
                strokeWidth="3"
              />
              <circle
                cx="0"
                cy="0"
                r="6"
                fill={config.pupilFill}
                className={pupilClass}
              />
            </g>
            <g transform="translate(130,90)">
              <circle
                cx="0"
                cy="0"
                r="15"
                fill="#fff"
                stroke={config.eyeStroke}
                strokeWidth="3"
              />
              <circle
                cx="0"
                cy="0"
                r="6"
                fill={config.pupilFill}
                className={pupilClass}
              />
            </g>
          </g>
          {/* 입 */}
          <path
            d={mouthD}
            stroke={state === 'wrong' ? config.mouthWrong : config.mouthGood}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          {/* 스킨별 디테일 */}
          {config.details}
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

      {/* 스타일 */}
      <style jsx>{`
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

/** 스킨별 모양/색 정의 */
function getSkinConfig(skin: 'bunny' | 'owl' | 'robot' | 'pencil') {
  switch (skin) {
    case 'owl': {
      // 부엉이: 둥근 몸통 + 부리 + 깃
      return {
        body: (
          <g>
            <rect
              x="30"
              y="30"
              width="140"
              height="140"
              rx="48"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="6"
            />
          </g>
        ),
        ears: (
          <g>
            <path
              d="M50,40 L70,10 L90,40 Z"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="4"
            />
            <path
              d="M110,40 L130,10 L150,40 Z"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="4"
            />
          </g>
        ),
        arms: (
          <g>
            <ellipse cx="48" cy="110" rx="16" ry="12" fill="#f59e0b" />
            <ellipse cx="152" cy="110" rx="16" ry="12" fill="#f59e0b" />
          </g>
        ),
        details: (
          <g>
            {/* 부리 */}
            <polygon points="100,110 92,124 108,124" fill="#92400e" />
            {/* 가슴 깃패턴 */}
            <path
              d="M60,140 q20,12 40,0 q20,-12 40,0"
              fill="none"
              stroke="#b45309"
              strokeWidth="4"
            />
          </g>
        ),
        eyeStroke: '#78350f',
        pupilFill: '#1f2937',
        mouthGood: '#78350f',
        mouthWrong: '#7f1d1d',
      };
    }
    case 'robot': {
      // 로봇: 각진 몸 + 안테나 + 볼트
      return {
        body: (
          <g>
            <rect
              x="30"
              y="40"
              width="140"
              height="120"
              rx="16"
              fill="#94a3b8"
              stroke="#475569"
              strokeWidth="6"
            />
            {/* 안테나 */}
            <line
              x1="100"
              y1="20"
              x2="100"
              y2="40"
              stroke="#475569"
              strokeWidth="6"
            />
            <circle cx="100" cy="18" r="6" fill="#ef4444" />
          </g>
        ),
        ears: (
          <g>
            {/* 측면 볼트 */}
            <circle cx="30" cy="100" r="6" fill="#334155" />
            <circle cx="170" cy="100" r="6" fill="#334155" />
          </g>
        ),
        arms: (
          <g>
            <rect x="28" y="90" width="24" height="28" rx="6" fill="#64748b" />
            <rect x="148" y="90" width="24" height="28" rx="6" fill="#64748b" />
          </g>
        ),
        details: (
          <g>
            {/* 패널 라인 */}
            <line
              x1="60"
              y1="140"
              x2="140"
              y2="140"
              stroke="#475569"
              strokeWidth="3"
            />
            <circle cx="75" cy="146" r="3" fill="#22c55e" />
            <circle cx="85" cy="146" r="3" fill="#fde047" />
            <circle cx="95" cy="146" r="3" fill="#ef4444" />
          </g>
        ),
        eyeStroke: '#0f172a',
        pupilFill: '#0f172a',
        mouthGood: '#0f172a',
        mouthWrong: '#7f1d1d',
      };
    }
    case 'pencil': {
      // 연필: 육각 몸체 + 지우개 + 심
      return {
        body: (
          <g>
            {/* 몸 */}
            <rect
              x="40"
              y="36"
              width="120"
              height="120"
              rx="22"
              fill="#fca5a5"
              stroke="#ef4444"
              strokeWidth="6"
            />
            {/* 지우개 띠 */}
            <rect x="40" y="36" width="120" height="18" fill="#fbcfe8" />
          </g>
        ),
        ears: (
          <g>
            {/* 심 */}
            <polygon points="100,26 88,40 112,40" fill="#1f2937" />
          </g>
        ),
        arms: (
          <g>
            <rect x="36" y="90" width="24" height="26" rx="8" fill="#f87171" />
            <rect x="140" y="90" width="24" height="26" rx="8" fill="#f87171" />
          </g>
        ),
        details: (
          <g>
            {/* 몸체 그레인 느낌 */}
            <line
              x1="70"
              y1="60"
              x2="70"
              y2="150"
              stroke="#fb7185"
              strokeWidth="2"
            />
            <line
              x1="100"
              y1="60"
              x2="100"
              y2="150"
              stroke="#fb7185"
              strokeWidth="2"
            />
            <line
              x1="130"
              y1="60"
              x2="130"
              y2="150"
              stroke="#fb7185"
              strokeWidth="2"
            />
          </g>
        ),
        eyeStroke: '#7f1d1d',
        pupilFill: '#7f1d1d',
        mouthGood: '#7f1d1d',
        mouthWrong: '#7f1d1d',
      };
    }
    default: // "bunny"
      return {
        body: (
          <g>
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
          </g>
        ),
        ears: (
          <g>
            <rect
              x="46"
              y="18"
              width="22"
              height="26"
              rx="10"
              fill="#10b981"
              transform="rotate(12 57 29)"
            />
            <rect
              x="132"
              y="18"
              width="22"
              height="26"
              rx="10"
              fill="#10b981"
              transform="rotate(-12 143 29)"
            />
          </g>
        ),
        arms: (
          <g>
            <rect x="36" y="82" width="28" height="28" rx="10" fill="#10b981" />
            <rect
              x="136"
              y="82"
              width="28"
              height="28"
              rx="10"
              fill="#10b981"
            />
          </g>
        ),
        details: null,
        eyeStroke: '#065f46',
        pupilFill: '#064e3b',
        mouthGood: '#064e3b',
        mouthWrong: '#7f1d1d',
      };
  }
}
