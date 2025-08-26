'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Variants, TargetAndTransition, Transition } from 'framer-motion';

type EyeTarget = { x: number; y: number }; // -1 ~ 1 범위 권장
type Mood = 'neutral' | 'happy' | 'sad';

type Props = {
  mood: Mood;
  eyeTarget: EyeTarget;
  shaking?: boolean;
  size?: number;
};

export default function MascotCuteLavender({
  mood,
  eyeTarget,
  shaking = false,
  size = 260,
}: Props) {
  const COLORS = {
    faceLight: '#F5F3FF',
    faceMid: '#E9D5FF',
    faceStroke: '#A78BFA', // 연보라 라인
    brow: '#4C1D95',
    pupil: '#111827',
    blush: '#E879F9', // 라일락 핑크
    sparkle1: '#C4B5FD',
    sparkle2: '#F0ABFC',
    sparkle3: '#A78BFA',
  };

  const w = size;
  const h = size;

  // 눈동자 최대 이동량
  const pupilOffset = useMemo(() => {
    const max = Math.max(5, size * 0.022);
    return { dx: eyeTarget.x * max, dy: eyeTarget.y * max };
  }, [eyeTarget.x, eyeTarget.y, size]);

  // 표정별 입 모양
  const mouthPath = useMemo(() => {
    if (mood === 'happy') return 'M -22 12 Q 0 28 22 12';
    if (mood === 'sad') return 'M -22 24 Q 0 6 22 24';
    return 'M -18 18 L 18 18';
  }, [mood]);

  // 머리 흔들림/리듬
  const headVariants: Variants = {
    idle: {
      y: 0,
      rotate: 0,
      transition: { type: 'spring', stiffness: 150, damping: 18 },
    },
    happy: {
      y: [-1, -4, -1],
      rotate: [-0.2, -1.2, -0.2],
      transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
    },
    sad: {
      y: [0, 2, 0],
      rotate: [0, 0.7, 0],
      transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  // 오답일 때 순간 쉐이크
  const shakeVariants: Variants = {
    still: {
      x: 0,
      rotate: 0,
      transition: { type: 'spring', stiffness: 200, damping: 18 },
    },
    shake: {
      x: [0, -8, 8, -6, 6, 0],
      rotate: [0, -2.5, 2.5, -2, 2, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    },
  };

  // 눈 깜빡임 (자연스럽게 드문드문)
  const blinkAnimate: TargetAndTransition = { ry: [20, 20, 2, 20] };
  const blinkTransition: Transition = {
    duration: 4.2,
    times: [0, 0.94, 0.97, 1],
    repeat: Infinity,
  };

  // 은은한 블러시(볼터치) — 가벼운 숨쉬기 느낌
  const blushPulse: TargetAndTransition =
    mood === 'happy'
      ? {
          scale: [1, 1.03, 1],
          opacity: [0.22, 0.28, 0.22],
          transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
        }
      : {
          scale: 1,
          opacity: 0.18,
        };

  const headState: keyof typeof headVariants =
    mood === 'happy' ? 'happy' : mood === 'sad' ? 'sad' : 'idle';

  // 살짝 올라가는 행복 눈썹/내려가는 슬픈 눈썹
  const browShiftY = mood === 'happy' ? -3 : mood === 'sad' ? 2 : 0;

  // 스파클은 더 미세하게(눈에 거슬리지 않게)
  const Sparkles: React.FC = () =>
    mood === 'happy' ? (
      <g opacity={0.65}>
        <circle cx="62" cy="44" r="2.5" fill={COLORS.sparkle1}>
          <animate
            attributeName="r"
            values="2.2;2.8;2.2"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
        <rect
          x="196"
          y="40"
          width="4"
          height="4"
          fill={COLORS.sparkle2}
          transform="rotate(45 198 42)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="45 198 42; 405 198 42; 45 198 42"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </rect>
      </g>
    ) : null;

  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: w, height: h }}
      variants={shakeVariants}
      animate={shaking ? 'shake' : 'still'}
      aria-hidden
    >
      <motion.div variants={headVariants} animate={headState}>
        <svg width={w} height={h} viewBox="0 0 260 260">
          <defs>
            <radialGradient id="lavFaceGrad" cx="50%" cy="38%">
              <stop offset="0%" stopColor={COLORS.faceLight} />
              <stop offset="100%" stopColor={COLORS.faceMid} />
            </radialGradient>
            <filter
              id="softShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#c7b7ff"
                floodOpacity="0.45"
              />
            </filter>
          </defs>

          {/* 얼굴 */}
          <circle
            cx="130"
            cy="130"
            r="100"
            fill="url(#lavFaceGrad)"
            stroke={COLORS.faceStroke}
            strokeWidth={3}
            filter="url(#softShadow)"
          />

          {/* 눈썹 */}
          <g
            stroke={COLORS.brow}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.95}
            transform={`translate(0 ${browShiftY})`}
          >
            <path d="M 76 90 Q 92 80 108 90" />
            <path d="M 152 90 Q 168 80 184 90" />
          </g>

          {/* 눈(흰자) */}
          <motion.ellipse
            cx={95}
            cy={110}
            rx={26}
            ry={20}
            fill="#ffffff"
            stroke={COLORS.faceStroke}
            strokeWidth={1}
            animate={blinkAnimate}
            transition={blinkTransition}
          />
          <motion.ellipse
            cx={165}
            cy={110}
            rx={26}
            ry={20}
            fill="#ffffff"
            stroke={COLORS.faceStroke}
            strokeWidth={1}
            animate={blinkAnimate}
            transition={blinkTransition}
          />

          {/* 눈동자 + 하이라이트 */}
          <g>
            <circle
              cx={95 + pupilOffset.dx}
              cy={110 + pupilOffset.dy}
              r={7}
              fill={COLORS.pupil}
            />
            <circle
              cx={95 + pupilOffset.dx - 2}
              cy={110 + pupilOffset.dy - 2.5}
              r={2}
              fill="#ffffff"
              opacity={0.9}
            />
          </g>
          <g>
            <circle
              cx={165 + pupilOffset.dx}
              cy={110 + pupilOffset.dy}
              r={7}
              fill={COLORS.pupil}
            />
            <circle
              cx={165 + pupilOffset.dx - 2}
              cy={110 + pupilOffset.dy - 2.5}
              r={2}
              fill="#ffffff"
              opacity={0.9}
            />
          </g>

          {/* 은은한 블러시(하트 제거, 부드러운 원형) */}
          <motion.circle
            cx={82}
            cy={148}
            r={12}
            fill={COLORS.blush}
            style={{ transformOrigin: '82px 148px' }}
            animate={blushPulse}
          />
          <motion.circle
            cx={178}
            cy={148}
            r={12}
            fill={COLORS.blush}
            style={{ transformOrigin: '178px 148px' }}
            animate={blushPulse}
          />

          {/* 입 */}
          <g transform="translate(130,150)">
            <motion.path
              d={mouthPath}
              fill="none"
              stroke={COLORS.brow}
              strokeWidth={6}
              strokeLinecap="round"
              animate={{ d: mouthPath }}
              transition={{ type: 'tween', duration: 0.2 }}
            />
          </g>

          {/* 해피 스파클 (아주 미세) */}
          <Sparkles />
        </svg>
      </motion.div>
    </motion.div>
  );
}
