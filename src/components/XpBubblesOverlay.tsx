import React from 'react';
import { useApp } from '../contexts/AppContext';
import { XpParticle } from './XpParticle';

export const XpBubblesOverlay: React.FC = () => {
  const { xpParticles, removeXpParticle } = useApp();

  return (
    <div className="fixed inset-0 pointer-events-none z-[99]">
      {xpParticles.map(particle => (
        <XpParticle
          key={particle.id}
          id={particle.id}
          startX={particle.startX}
          startY={particle.startY}
          targetX={particle.targetX}
          targetY={particle.targetY}
          value={particle.value}
          onComplete={removeXpParticle}
        />
      ))}
    </div>
  );
};