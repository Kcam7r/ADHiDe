import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

export const LevelUpFlashOverlay: React.FC = () => {
  const { levelUpFlashKey } = useApp();
  const [showFlash, setShowFlash] = useState(false);
  const prevLevelUpFlashKeyRef = useRef(levelUpFlashKey);

  useEffect(() => {
    if (levelUpFlashKey > 0 && levelUpFlashKey !== prevLevelUpFlashKeyRef.current) {
      setShowFlash(true);
      const timer = setTimeout(() => {
        setShowFlash(false);
      }, 800); // Czas trwania animacji level-up-spread-flash
      return () => clearTimeout(timer);
    }
    prevLevelUpFlashKeyRef.current = levelUpFlashKey;
  }, [levelUpFlashKey]);

  if (!showFlash) return null;

  return (
    <div
      className="fixed inset-0 z-[99] pointer-events-none flex items-center justify-center"
    >
      <div
        className="absolute w-full h-full rounded-full bg-white opacity-70 animate-level-up-spread-flash"
        style={{ filter: 'blur(5px)' }}
      ></div>
    </div>
  );
};