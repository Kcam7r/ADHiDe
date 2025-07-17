import React, { useState, useEffect, useRef } from 'react';
import { Mission } from '../types';
import { useApp } from '../contexts/AppContext';
import { Flame, Star, BatteryLow, BatteryMedium, BatteryFull, Brain } from 'lucide-react';

interface MissionCompleteAnimatorProps {
  mission: Mission;
  xpGain: number;
  missionRect: DOMRect; // Pozycja i rozmiar oryginalnej karty misji
  onAnimationComplete: (missionId: string) => void;
}

export const MissionCompleteAnimator: React.FC<MissionCompleteAnimatorProps> = ({
  mission,
  xpGain,
  missionRect,
  onAnimationComplete,
}) => {
  const { addXP } = useApp();
  const [stage, setStage] = useState(0); // 0: initial, 1: tremble, 2: disintegrate, 3: reward
  const [xpTextVisible, setXpTextVisible] = useState(false);
  const [particlesGenerated, setParticlesGenerated] = useState(false);
  const animatorRef = useRef<HTMLDivElement>(null);

  // Helper functions for icons and colors (copied from Dashboard for consistency)
  const getPriorityIcon = (priority: Mission['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Flame className="w-4 h-4 text-white" />;
      case 'important':
        return <Star className="w-4 h-4 text-white" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Mission['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-white';
      case 'important':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  const getEnergyIcon = (energy: Mission['energy']) => {
    switch (energy) {
      case 'low':
        return <BatteryLow className="w-4 h-4 text-white" />;
      case 'medium':
        return <BatteryMedium className="w-4 h-4 text-white" />;
      case 'high':
        return <BatteryFull className="w-4 h-4 text-white" />;
      case 'concentration':
        return <Brain className="w-4 h-4 text-white" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // Stage 1: Tremble and Pulse (0 - 0.5s)
    const stage1Timer = setTimeout(() => {
      setStage(1);
      // Here you would play the "building tension" sound
      // Example: playSound('tension_build_up');
    }, 50); // Small delay to ensure component is mounted and positioned

    // Stage 2: Disintegration (0.5s - 1.5s)
    const stage2Timer = setTimeout(() => {
      setStage(2);
      // Here you would play the "disintegration" sound
      // Example: playSound('disintegrate_whoosh');
    }, 500);

    // Stage 3: Reward (+XP! text and particles fly) (1.5s - 2.5s)
    const stage3Timer = setTimeout(() => {
      setStage(3);
      setXpTextVisible(true);
      setParticlesGenerated(true); // Trigger XP particles
      addXP(xpGain, missionRect.x + missionRect.width / 2, missionRect.y + missionRect.height / 2);
      // Here you would play the "satisfying clink" sound
      // Example: playSound('xp_clink');
    }, 1500);

    // Final cleanup: Remove component and update AppContext (2.5s)
    const finalTimer = setTimeout(() => {
      onAnimationComplete(mission.id);
    }, 2500);

    return () => {
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
      clearTimeout(stage3Timer);
      clearTimeout(finalTimer);
    };
  }, [mission.id, xpGain, missionRect, onAnimationComplete, addXP]);

  // Render a duplicate of the mission card at its original position
  // This card will then animate
  return (
    <div
      ref={animatorRef}
      className="fixed z-50 pointer-events-none"
      style={{
        top: missionRect.y,
        left: missionRect.x,
        width: missionRect.width,
        height: missionRect.height,
      }}
    >
      {/* The animating mission card */}
      <div
        className={`p-4 rounded-lg
          ${mission.projectId ? 'bg-purple-600' : 'bg-cyan-600'}
          ${stage === 1 ? 'animate-tremble-pulse' : ''}
          ${stage >= 2 ? 'animate-disintegrate-fade' : ''}
          ${stage === 3 ? 'opacity-0' : ''}
        `}
        style={{
          // Ensure it stays within its original bounds for the animation
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPriorityIcon(mission.priority)}
            <span className={`font-medium ${getPriorityColor(mission.priority)}`}>
              {mission.title}
            </span>
          </div>
          <div>{getEnergyIcon(mission.energy)}</div>
        </div>
        {mission.description && (
          <p className="text-gray-200 text-sm mt-2">{mission.description}</p>
        )}
      </div>

      {/* +XP! text animation */}
      {xpTextVisible && (
        <div
          className="absolute text-white font-bold text-3xl animate-xp-pop"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textShadow: '0 0 10px rgba(255,255,255,0.8)',
          }}
        >
          +{xpGain} XP!
        </div>
      )}
    </div>
  );
};