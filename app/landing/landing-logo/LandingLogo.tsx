'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { IoChevronDown } from 'react-icons/io5';
import confetti from 'canvas-confetti';

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
  const spacing = 120;
  const totalWidth = (total - 1) * spacing;
  const startX = -totalWidth / 2;
  return { x: startX + index * spacing, y: 0 };
};

export default function LandingLogo() {
  const [animationPhase, setAnimationPhase] = useState<'falling' | 'complete'>(
    'falling'
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setAnimationPhase('complete');
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (animationPhase !== 'complete') return;

    const els = Array.from(
      document.querySelectorAll('[data-logo]')
    ) as HTMLElement[];
    els.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      };
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          startVelocity: 50,
          origin,
        });
      }, i * 120);
    });
  }, [animationPhase]);

  if (!isClient) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center opacity-0">
          {' '}
          {/* opacity-0으로 숨김 */}
          <h1 className="mb-2 text-4xl font-bold text-gray-800">
            기초학력의 시작
          </h1>
          <h2 className="text-6xl font-extrabold">Ssemtle</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative flex h-80 w-full items-center justify-center">
        {logos.map((logo, index) => {
          const linearPos = getLinearPosition(index, logos.length);

          return (
            <motion.div
              key={index}
              data-logo={index}
              className="absolute z-10"
              initial={{
                y: -2000,
                x: Math.random() * 200 - 100,
                rotate: Math.random() * 360,
              }}
              animate={
                animationPhase === 'complete'
                  ? {
                      x: linearPos.x,
                      y: [
                        linearPos.y,
                        linearPos.y - 15,
                        linearPos.y + 5,
                        linearPos.y,
                      ],
                      scale: [1, 1.1, 0.95, 1],
                      rotate: [0, 5, -5, 0],
                      transition: {
                        x: { duration: 0 },
                        y: {
                          duration: 4,
                          delay: 5 + index * 0.3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'easeInOut',
                        },
                        scale: {
                          duration: 4,
                          delay: 5 + index * 0.3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'easeInOut',
                        },
                        rotate: {
                          duration: 4,
                          delay: 5 + index * 0.3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'easeInOut',
                        },
                      },
                    }
                  : {
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
                        rotate: {
                          duration: 1.5,
                          delay: index * 0.3 + 0.5,
                          ease: 'easeOut',
                        },
                      },
                    }
              }
              whileHover={{
                scale: 1.2,
                y: -15,
                transition: { duration: 0.2 },
              }}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={100}
                height={100}
                className="drop-shadow-lg"
                priority={index < 3}
              />
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
          className="text-4xl font-bold text-gray-800"
          style={{
            backgroundImage: 'linear-gradient(45deg, #667eea 0%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
          animate={
            animationPhase === 'complete' ? { opacity: 1 } : { opacity: 0 }
          }
          transition={{ duration: 1, delay: 1 }}
        >
          기초학력 수학
        </motion.h1>

        <motion.h2
          className="text-6xl font-extrabold"
          style={{
            backgroundImage: 'linear-gradient(45deg, #667eea 0%)',
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={
          animationPhase === 'complete'
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        transition={{
          duration: 0.8,
          delay: 2,
          ease: 'easeOut',
        }}
        className="flex flex-col items-center pt-3"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              delay: index * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          >
            <IoChevronDown
              className="text-4xl text-indigo-600 opacity-80"
              size={48}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
