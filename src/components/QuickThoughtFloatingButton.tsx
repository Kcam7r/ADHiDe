import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';

interface QuickThoughtFloatingButtonProps {
  onOpenNewThought: () => void; // Zmieniono nazwę propa
}

export const QuickThoughtFloatingButton: React.FC<QuickThoughtFloatingButtonProps> = ({ onOpenNewThought }) => {
  const { width, height } = useWindowSize();
  const [isDragging, setIsDragging] = useState(false);
  
  // Inicjalizuj pozycję: 270px od lewej (aby ominąć sidebar), 20px od dołu
  const [position, setPosition] = useState({ left: 270, bottom: 20 });

  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    // Upewnij się, że przycisk pozostaje w granicach po zmianie rozmiaru
    if (buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      const buttonHeight = buttonRef.current.offsetHeight;

      setPosition(prev => ({
        left: Math.max(270, Math.min(prev.left, width - buttonWidth - 20)),
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

      // Oblicz nową wartość bottom
      let newBottom = height - (newTop + buttonHeight);

      // Ogranicz pozycję, aby przycisk pozostawał w widocznym obszarze
      newLeft = Math.max(270, Math.min(newLeft, width - buttonWidth - 20));
      newBottom = Math.max(20, Math.min(newBottom, height - buttonHeight - 20));
      
      setPosition({ left: newLeft, bottom: newBottom });
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
      onOpenNewThought(); // Wywołaj nową prop
    }
  };

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`fixed z-40 p-3 cursor-grab active:cursor-grabbing hover:scale-110 text-yellow-400
        ${isDragging ? 'transition-none' : 'transition-all duration-200'}
        rounded-full
      `}
      style={{ left: position.left, bottom: position.bottom }}
      title="Szybka Myśl"
    >
      <Lightbulb className="w-14 h-14" />
    </button>
  );
};