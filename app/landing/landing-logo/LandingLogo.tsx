'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const logos = [
  { src: '/logos/logo-Sr.svg', alt: 'Sr' },
  { src: '/logos/logo-Sy.svg', alt: 'Sy' },
  { src: '/logos/logo-Eb.svg', alt: 'Eb' },
  { src: '/logos/logo-M.svg', alt: 'M' },
  { src: '/logos/logo-T.svg', alt: 'T' },
  { src: '/logos/logo-L.svg', alt: 'L' },
  { src: '/logos/logo-Eg.svg', alt: 'Eg' },
];

const getLinearPosition = (index: number, total: number) => {
  const spacing = 100;
  const totalWidth = (total - 1) * spacing;
  const startX = -totalWidth / 2;
  return { x: startX + index * spacing, y: 0 };
};

export default function LandingLogo() {
  const [animationPhase, setAnimationPhase] = useState<'falling' | 'complete'>(
    'falling'
  );
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase('complete');
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleImageError = (index: number) => {
    console.log(`[v0] Image error for logo ${index}: ${logos[index].src}`);
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative flex h-80 w-full items-center justify-center">
        {logos.map((logo, index) => {
          const linearPos = getLinearPosition(index, logos.length);

          return (
            <motion.div
              key={index}
              className="absolute z-10"
              initial={{
                y: -2000,
                x: Math.random() * 200 - 100,
                rotate: Math.random() * 360,
              }}
              animate={{
                x: linearPos.x,
                y: linearPos.y,
                rotate: 0,
                transition: {
                  duration: 2,
                  delay: index * 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  y: {
                    type: 'spring',
                    damping: 6,
                    stiffness: 80,
                    restDelta: 0.001,
                    bounce: 0.6,
                  },
                },
              }}
              whileHover={{
                scale: 1.2,
                y: -10,
                transition: { duration: 0.2 },
              }}
            >
              {imageErrors[index] ? (
                <div className="flex h-[80px] w-[80px] items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 text-lg font-bold text-white drop-shadow-lg">
                  {logo.alt}
                </div>
              ) : (
                <Image
                  src={logo.src || '/placeholder.svg'}
                  alt={logo.alt}
                  width={80}
                  height={80}
                  className="drop-shadow-lg"
                  onError={() => handleImageError(index)}
                  priority={index < 3}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={
          animationPhase === 'complete'
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 50 }
        }
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: 'easeOut',
        }}
        className="text-center"
      >
        <motion.h1
          className="mb-2 text-4xl font-bold text-gray-800"
          style={{
            backgroundImage: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
          animate={
            animationPhase === 'complete' ? { opacity: 1 } : { opacity: 0 }
          }
          transition={{ duration: 1, delay: 1 }}
        >
          기초학력의 시작
        </motion.h1>

        <motion.h2
          className="text-6xl font-extrabold"
          style={{
            backgroundImage: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
          animate={
            animationPhase === 'complete'
              ? { scale: [1, 1.05, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: 2,
            delay: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          SSemtle
        </motion.h2>
      </motion.div>

      <div className="pointer-events-none absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-blue-300 opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
