import React, { useState, useEffect, useRef } from 'react';
import { PomodoroModal } from './PomodoroModal';
import { useWindowSize } from '../hooks/useWindowSize';

export const PomodoroTimer: React.FC = () => {
  const { width, height } = useWindowSize();
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Inicjalizuj pozycję za pomocą funkcji, aby upewnić się, że obiekt window jest dostępny
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 }; // Domyślne dla SSR, zostanie zaktualizowane po stronie klienta
    }
    // Początkowa pozycja: 80px od prawej, 80px od dołu ekranu
    return { x: window.innerWidth - 80, y: window.innerHeight - 80 };
  });

  const offset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasMoved = useRef(false);

  // Ten useEffect jest nadal przydatny do obsługi zmiany rozmiaru okna po początkowym renderowaniu
  useEffect(() => {
    // Upewnij się, że przycisk pozostaje w granicach po zmianie rozmiaru
    if (buttonRef.current) {
      const maxX = width - buttonRef.current.offsetWidth;
      const maxY = height - buttonRef.current.offsetHeight;
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY)),
      }));
    }
  }, [width, height]); // Zależność od width/height z useWindowSize

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
  }, [isDragging, width, height]); // Dodano width i height do zależności dla prawidłowego sprawdzania granic podczas przeciągania

  const handleClick = () => {
    // Otwórz modal tylko jeśli nie było ruchu myszy (czyli było to kliknięcie, a nie przeciągnięcie)
    if (!hasMoved.current) {
      setShowModal(true);
    }
    // Flaga hasMoved jest resetowana w handleMouseDown dla kolejnej interakcji
  };

  return (
    <>
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className={`fixed z-40 p-3 cursor-grab active:cursor-grabbing text-5xl hover:scale-110 ${isDragging ? 'transition-none' : 'transition-all duration-200'}`}
        style={{ left: position.x, top: position.y }}
        title="Timer Pomodoro"
      >
        🍅
      </button>

      {showModal && <PomodoroModal onClose={() => setShowModal(false)} />}
    </>
  );
};