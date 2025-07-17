import React, { useState, useEffect, useRef } from 'react';
import { Timer } from 'lucide-react'; // Timer jest nadal importowany, ale nie używany bezpośrednio w JSX
import { PomodoroModal } from './PomodoroModal';
import { useWindowSize } from '../hooks/useWindowSize';

export const PomodoroTimer: React.FC = () => {
  const { width, height } = useWindowSize();
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: width - 80, y: height - 80 }); // Initial position: bottom-right
  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Update initial position if window size changes
    setPosition({ x: width - 80, y: height - 80 });
  }, [width, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      setIsDragging(true);
      offset.current = {
        x: e.clientX - buttonRef.current.getBoundingClientRect().left,
        y: e.clientY - buttonRef.current.getBoundingClientRect().top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    let newX = e.clientX - offset.current.x;
    let newY = e.clientY - offset.current.y;

    // Keep button within viewport bounds
    if (buttonRef.current) {
      const maxX = width - buttonRef.current.offsetWidth;
      const maxY = height - buttonRef.current.offsetHeight;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
    }

    setPosition({ x: newX, y: newY });
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
  }, [isDragging]);

  const handleClick = () => {
    if (!isDragging) { // Only open modal if not dragging
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        // Zaktualizowane klasy: większy tekst, brak tła po najechaniu, dodany efekt skalowania
        className="fixed z-40 p-3 cursor-grab active:cursor-grabbing transition-all duration-200 text-5xl hover:scale-110"
        style={{ left: position.x, top: position.y }}
      >
        🍅 {/* Emoji pomidora */}
      </button>

      {showModal && <PomodoroModal onClose={() => setShowModal(false)} />}
    </>
  );
};