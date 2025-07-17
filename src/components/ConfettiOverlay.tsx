import React, { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import { useApp } from '../contexts/AppContext';
import { useWindowSize } from '../hooks/useWindowSize';

export const ConfettiOverlay: React.FC = () => {
  const { user } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const prevLevelRef = useRef(user.level);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // Trigger confetti only if the level has increased
    if (user.level > prevLevelRef.current) {
      setShowConfetti(true);
      // No need for a fixed setTimeout to hide, onConfettiComplete will handle it
    }
    // Update previous level for the next comparison
    prevLevelRef.current = user.level;
  }, [user.level]);

  const handleConfettiComplete = () => {
    setShowConfetti(false); // Hide the component only when all pieces are done
  };

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <Confetti
        width={width}
        height={height}
        recycle={false} // Generate a fixed number of pieces once
        numberOfPieces={1500} // Significantly more pieces for a bigger burst
        gravity={0.08} // Slightly increased gravity for a more natural fall
        initialVelocityX={{ min: -15, max: 15 }} // Wider horizontal spread
        initialVelocityY={{ min: -30, max: -15 }} // Stronger initial upward velocity
        confettiSource={{
          x: 0, // Start from left edge
          y: height, // Start from the very bottom
          w: width, // Spread across the entire width
          h: 0, // A thin line at the bottom for the source
        }}
        onConfettiComplete={handleConfettiComplete} // Callback when all pieces are off screen
      />
    </div>
  );
};