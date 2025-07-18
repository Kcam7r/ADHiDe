import React, { useState, useEffect, useRef } from 'react';
import { PomodoroModal } from './PomodoroModal';
import { useWindowSize } from '../hooks/useWindowSize';

export const PomodoroTimer: React.FC = () => {
  const { width, height } = useWindowSize();
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Inicjalizuj pozycję w prawym dolnym rogu z marginesem 20px
  const [position, setPosition] = useState({ right: 20, bottom: 20 });

  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasMoved = useRef(false);

  // Ten useEffect jest nadal przydatny do obsługi zmiany rozmiaru okna po początkowym renderowaniu
  useEffect(() => {
    // Upewnij się, że przycisk pozostaje w granicach po zmianie rozmiaru
    if (buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      const buttonHeight = buttonRef.current.offsetHeight;

      setPosition(prev => ({
        right: Math.max(20, Math.min(prev.right, width - buttonWidth - 20)),
        bottom: Math.max(20, Math.min(prev.bottom, height - buttonHeight - 20)),
      }));
    }
  }, [width, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      setIsDragging(true);
      hasMoved.current = false;
      const rect = buttonRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    hasMoved.current = true;

    if (buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      const buttonHeight = buttonRef.current.offsetHeight;

      let newLeft = e.clientX - offset.current.x;
      let newTop = e.clientY - offset.current.y;

      // Oblicz nowe wartości right i bottom
      let newRight = width - (newLeft + buttonWidth);
      let newBottom = height - (newTop + buttonHeight);

      // Ogranicz pozycję, aby przycisk pozostawał w widocznym obszarze
      newRight = Math.max(20, Math.min(newRight, width - buttonWidth - 20));
      newBottom = Math.max(20, Math.min(newBottom, height - buttonHeight - 20));
      
      setPosition({ right: newRight, bottom: newBottom });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, width, height]);

  const handleClick = () => {
    if (!hasMoved.current) {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className={`fixed z-40 p-3 cursor-grab active:cursor-grabbing text-5xl hover:scale-110 ${isDragging ? 'transition-none' : 'transition-all duration-200'}`}
        style={{ right: position.right, bottom: position.bottom }}
        title="Timer Pomodoro"
      >
        🍅
      </button>

      {showModal && <PomodoroModal onClose={() => setShowModal(false)} />}
    </>
  );
};