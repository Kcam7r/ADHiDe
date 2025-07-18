import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface QuickThoughtFloatingButtonProps {
  onOpenNewThought: () => void;
}

export const QuickThoughtFloatingButton: React.FC<QuickThoughtFloatingButtonProps> = ({ onOpenNewThought }) => {
  const { width, height } = useWindowSize();
  const [isDragging, setIsDragging] = useState(false);
  // Początkowa pozycja: 270px od lewej (szerokość sidebar + margines), 20px od dołu
  const [position, setPosition] = useLocalStorage('adhd-quick-thought-button-pos', { x: 270, y: height - 80 });
  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasMoved = useRef(false);

  // Zaktualizuj początkową pozycję Y, jeśli zmieni się wysokość okna
  useEffect(() => {
    setPosition(prev => ({ ...prev, y: height - 80 }));
  }, [height, setPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      setIsDragging(true);
      hasMoved.current = false;
      offset.current = {
        x: e.clientX - buttonRef.current.getBoundingClientRect().left,
        y: e.clientY - buttonRef.current.getBoundingClientRect().top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    hasMoved.current = true;

    let newX = e.clientX - offset.current.x;
    let newY = e.clientY - offset.current.y;

    if (buttonRef.current) {
      const maxX = width - buttonRef.current.offsetWidth;
      const maxY = height - buttonRef.current.offsetHeight;

      // Ogranicz pozycję X, aby nie wchodzić na sidebar (szerokość sidebar to 256px)
      newX = Math.max(256, Math.min(newX, maxX));
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
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleClick = () => {
    if (!hasMoved.current) {
      onOpenNewThought();
    }
  };

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`fixed z-40 p-3 cursor-grab active:cursor-grabbing text-5xl hover:scale-110 text-yellow-400
        ${isDragging ? 'transition-none' : 'transition-all duration-200'}
      `}
      style={{ left: position.x, top: position.y }}
      title="Szybka Myśl"
    >
      <Lightbulb className="w-auto h-auto" />
    </button>
  );
};