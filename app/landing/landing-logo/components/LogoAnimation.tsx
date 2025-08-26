import { motion } from 'framer-motion';
import Image from 'next/image';
import { logos } from '@/utils/logs/logos';
import { useMemo } from 'react';

interface LogoAnimationProps {
  animationPhase: 'falling' | 'complete';
}

const getLinearPosition = (index: number, total: number) => {
  const spacing = 120;
  const totalWidth = (total - 1) * spacing;
  const startX = -totalWidth / 2;
  return { x: startX + index * spacing, y: 0 };
};

export default function LogoAnimation({ animationPhase }: LogoAnimationProps) {
  const logoPositions = useMemo(
    () => logos.map((_, index) => getLinearPosition(index, logos.length)),
    []
  );

  return (
    <div className="relative h-48 w-full sm:h-64 lg:h-80">
      <div className="hidden h-full w-full items-center justify-center lg:flex">
        {logos.map((logo, index) => {
          const linearPos = logoPositions[index];

          return (
            <motion.div
              key={index}
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
                          duration: 3,
                          delay: 3 + index * 0.2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'easeInOut',
                        },
                        scale: {
                          duration: 3,
                          delay: 3 + index * 0.2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'easeInOut',
                        },
                        rotate: {
                          duration: 3,
                          delay: 3 + index * 0.2,
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
                        duration: 1.5,
                        delay: index * 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        y: {
                          type: 'spring',
                          damping: 8,
                          stiffness: 100,
                          restDelta: 0.001,
                          bounce: 0.4,
                        },
                        rotate: {
                          duration: 1,
                          delay: index * 0.2 + 0.3,
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
                loading={index < 3 ? 'eager' : 'lazy'}
              />
            </motion.div>
          );
        })}
      </div>

      {/* 모바일/태블릿 레이아웃 */}
      <div className="flex h-full w-full items-center justify-center px-4 lg:hidden">
        <div className="flex items-center justify-center gap-2">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ y: -200 }}
              animate={
                animationPhase === 'complete' ? { y: [0, -8, 0] } : { y: 0 }
              }
              transition={{
                duration: 1,
                delay: index * 0.12,
                repeat:
                  animationPhase === 'complete' ? Number.POSITIVE_INFINITY : 0,
                ease: 'easeInOut',
              }}
              className="flex-none md:hover:scale-105"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={100}
                height={100}
                style={{ width: 'clamp(40px, 12vw, 80px)', height: 'auto' }}
                className="drop-shadow-lg"
                priority={index < 3}
                loading={index < 3 ? 'eager' : 'lazy'}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
