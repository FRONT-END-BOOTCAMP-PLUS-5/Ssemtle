import { motion } from 'framer-motion';
import { IoChevronDown } from 'react-icons/io5';

interface ScrollIndicatorProps {
  animationPhase: 'falling' | 'complete';
}

export default function ScrollIndicator({
  animationPhase,
}: ScrollIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={
        animationPhase === 'complete'
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 20 }
      }
      transition={{
        duration: 0.6,
        delay: 1.5,
        ease: 'easeOut',
      }}
      className="flex flex-col items-center pt-3"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.2,
            delay: index * 0.15,
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
  );
}
