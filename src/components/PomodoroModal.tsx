import React from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface PomodoroModalProps {
  onClose: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ onClose }) => {
  // Placeholder for Pomodoro logic
  const [time, setTime] = React.useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = React.useState(false);
  const [mode, setMode] = React.useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      // Here you would typically switch modes or notify user
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

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
    setMode('pomodoro');
    setTime(25 * 60);
  };

  const handleModeChange = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsActive(false);
    switch (newMode) {
      case 'pomodoro':
        setTime(25 * 60);
        break;
      case 'shortBreak':
        setTime(5 * 60);
        break;
      case 'longBreak':
        setTime(15 * 60);
        break;
    }
  };

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
        
        <div className="flex justify-around mb-4">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${mode === 'pomodoro' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${mode === 'shortBreak' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Krótka przerwa
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${mode === 'longBreak' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Długa przerwa
          </button>
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