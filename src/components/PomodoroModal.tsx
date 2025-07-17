import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface PomodoroModalProps {
  onClose: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ onClose }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25); // Domyślny czas: 25 minut
  const [time, setTime] = useState(selectedMinutes * 60); // Czas w sekundach
  const [isActive, setIsActive] = useState(false);
  const [isEditingMinutes, setIsEditingMinutes] = useState(false); // Nowy stan do edycji minut
  const inputRef = useRef<HTMLInputElement>(null); // Referencja do pola input

  // Efekt do obsługi odliczania czasu
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      // Tutaj można dodać logikę po zakończeniu sesji, np. powiadomienie
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  // Efekt do aktualizacji czasu, gdy zmieni się selectedMinutes (np. przez suwak lub ręczne wpisanie)
  useEffect(() => {
    setTime(selectedMinutes * 60);
    setIsActive(false); // Zatrzymujemy timer po zmianie czasu
  }, [selectedMinutes]);

  // Efekt do automatycznego focusowania inputa po przejściu w tryb edycji
  useEffect(() => {
    if (isEditingMinutes && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingMinutes]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(selectedMinutes * 60); // Resetuj do aktualnie wybranej wartości
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMinutes(parseInt(e.target.value));
  };

  const handleManualMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Pozwól na puste pole podczas wpisywania, ale ustaw domyślną wartość przy zatwierdzeniu
    if (!isNaN(value)) {
      setSelectedMinutes(value);
    }
  };

  const handleInputBlur = () => {
    // Upewnij się, że wartość jest w rozsądnym zakresie po zakończeniu edycji
    let finalMinutes = selectedMinutes;
    if (isNaN(finalMinutes) || finalMinutes < 1) {
      finalMinutes = 1; // Minimalna wartość
    } else if (finalMinutes > 180) { // Maksymalna wartość, np. 3 godziny
      finalMinutes = 180;
    }
    setSelectedMinutes(finalMinutes);
    setIsEditingMinutes(false);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur(); // Wywołaj blur, aby uruchomić handleInputBlur
    }
  };

  // Renderowanie pełnoekranowego zegara, gdy timer jest aktywny
  if (isActive && time > 0) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer"
        onClick={() => setIsActive(false)} // Kliknięcie na zegar zatrzymuje go i otwiera popup
      >
        <span className="text-8xl font-bold text-white select-none">
          {formatTime(time)}
        </span>
      </div>
    );
  }

  // Renderowanie popupu z ustawieniami, gdy timer jest zatrzymany lub zakończony
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center space-x-2">
            <span>🍅</span>
            <span>Pomodoro</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Suwak do ustawiania czasu */}
        <div className="mb-6">
          <label htmlFor="pomodoro-minutes" className="block text-sm font-medium text-gray-300 mb-2">
            Ustaw czas (minuty):{' '}
            {isEditingMinutes ? (
              <input
                ref={inputRef}
                type="number"
                value={selectedMinutes}
                onChange={handleManualMinutesChange}
                onBlur={handleInputBlur}
                onKeyPress={handleInputKeyPress}
                className="bg-gray-700 text-white rounded-md px-2 py-1 w-20 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="1"
                max="180"
              />
            ) : (
              <span
                className="font-bold text-white cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => setIsEditingMinutes(true)}
              >
                {selectedMinutes}
              </span>
            )}
          </label>
          <input
            id="pomodoro-minutes"
            type="range"
            min="5"
            max="60"
            step="1"
            value={selectedMinutes}
            onChange={handleMinutesChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 min</span>
            <span>60 min</span>
          </div>
        </div>

        <div className="text-center my-8">
          <span className="text-6xl font-bold text-white">
            {formatTime(time)}
          </span>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleStartPause}
            className="bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-full transition-colors"
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};