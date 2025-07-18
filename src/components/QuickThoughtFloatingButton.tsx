import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';
// Usunięto import useLocalStorage

interface QuickThoughtFloatingButtonProps {
  onOpenNewThought: () => void;
}

export const QuickThoughtFloatingButton: React.FC<QuickThoughtFloatingButtonProps> = ({ onOpenNewThought }) => {
  const { width, height } = useWindowSize();
  const [isDragging, setIsDragging] = useState(false);
  
  // Używamy useState bezpośrednio, inicjalizując pozycję dynamicznie
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') {
      return { x: 270, y: 0 }; // Wartość domyślna dla SSR
    }
    // Początkowa pozycja: 270px od lewej, 80px od dołu ekranu
    return { x: 270, y: window.innerHeight - 80 };
  });

  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasMoved = useRef(false);

  // Usunięto useEffect do aktualizacji 'y' na zmianę wysokości okna,
  // ponieważ handleMouseMove będzie dynamicznie zarządzać pozycją.

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

      // Ograniczamy pozycję, aby przycisk pozostawał w widocznym obszarze
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
  }, [isDragging, width, height]); // Dodano width i height do zależności dla prawidłowego ograniczania

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
      className={`fixed z-40 p-3 cursor-grab active:cursor-grabbing hover:scale-110 text-yellow-400
        ${isDragging ? 'transition-none' : 'transition-all duration-200'}
        rounded-full
      `}
      style={{ left: position.x, top: position.y }}
      title="Szybka Myśl"
    >
      <Lightbulb className="w-14 h-14" />
    </button>
  );
};