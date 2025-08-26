import { motion } from 'framer-motion';

interface TextAnimatedProps {
  animationPhase: 'falling' | 'complete';
}

export default function TextAnimated({ animationPhase }: TextAnimatedProps) {
  return (
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
        수학의 틀을 잡는 순간
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
          animationPhase === 'complete' ? { scale: [1, 1.05, 1] } : { scale: 1 }
        }
        transition={{
          duration: 2,
          delay: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        Ssemtle
      </motion.h2>
    </motion.div>
  );
}
