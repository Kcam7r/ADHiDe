import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface DailyTaskStampProps {
  onAnimationEnd: () => void;
}

export const DailyTaskStamp: React.FC<DailyTaskStampProps> = ({ onAnimationEnd }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setAnimate(true);
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 500); // Duration of the initial "hit" animation

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none`}
    >
      <CheckCircle
        className={`w-16 h-16 text-green-400 opacity-0 transition-all duration-500 ease-out
          ${animate ? 'scale-100 opacity-70 animate-stamp-hit' : 'scale-0'}
        `}
        style={{ filter: 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.8))' }} // Green glow
      />
    </div>
  );
};