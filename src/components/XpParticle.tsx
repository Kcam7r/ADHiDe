import React, { useEffect, useRef } from 'react';

interface XpParticleProps {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  value: number;
  onComplete: (id: string) => void;
}

export const XpParticle: React.FC<XpParticleProps> = ({ id, startX, startY, targetX, targetY, value, onComplete }) => {
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particleElement = particleRef.current;
    if (!particleElement) return;

    // Set initial position
    particleElement.style.left = `${startX}px`;
    particleElement.style.top = `${startY}px`;

    // Trigger animation
    // Using setTimeout to ensure initial position is applied before animation starts
    const animationTimeout = setTimeout(() => {
      particleElement.classList.add('animate-xp-particle');
      // Set CSS variables for animation
      particleElement.style.setProperty('--target-x', `${targetX - startX}px`);
      particleElement.style.setProperty('--target-y', `${targetY - startY}px`);
    }, 50); // Small delay

    const handleAnimationEnd = () => {
      particleElement.classList.remove('animate-xp-particle');
      onComplete(id);
    };

    particleElement.addEventListener('animationend', handleAnimationEnd);

    return () => {
      clearTimeout(animationTimeout);
      particleElement.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [startX, startY, targetX, targetY, onComplete, id]);

  return (
    <div
      ref={particleRef}
      className="fixed z-[100] w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-white opacity-0"
      style={{
        // Usunięto: transform: `translate(-50%, -50%)`, // Ta transformacja będzie teraz w CSS animacji
        filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.8))', // Amber glow (amber-500)
      }}
    >
      {value > 0 && <span className="text-[8px]">{value}</span>}
    </div>
  );
};