import React, { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import { useApp } from '../contexts/AppContext';
import { useWindowSize } from '../hooks/useWindowSize';

export const ConfettiOverlay: React.FC = () => {
  const { user, triggerConfetti: appTriggerConfetti } = useApp(); // Zmieniono nazwę, aby uniknąć konfliktu
  const [showConfetti, setShowConfetti] = useState(false);
  const prevLevelRef = useRef(user.level);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // Trigger confetti only if the level has increased
    if (user.level > prevLevelRef.current) {
      setShowConfetti(true);
    }
    // Update previous level for the next comparison
    prevLevelRef.current = user.level;
  }, [user.level]);

  // Nowy useEffect do reagowania na wywołanie triggerConfetti z kontekstu
  useEffect(() => {
    if (appTriggerConfetti) { // Sprawdź, czy funkcja została wywołana
      setShowConfetti(true);
      // Resetuj stan konfetti po krótkim czasie, aby umożliwić ponowne wywołanie
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 2000); // Czas trwania konfetti
      return () => clearTimeout(timer);
    }
  }, [appTriggerConfetti]); // Zależność od funkcji triggerConfetti z kontekstu

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