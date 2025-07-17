import React from 'react';
import { X } from 'lucide-react';
import { Calendar } from './Calendar';

interface CalendarModalProps {
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  highlightedDates?: Date[];
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ onClose, selectedDate, onSelectDate, highlightedDates }) => {
  const handleDateSelection = (date: Date) => {
    onSelectDate(date);
    onClose(); // Close modal after selecting a date
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center space-x-2">
            <span>🗓️</span>
            <span>Wybierz Datę</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={handleDateSelection}
          highlightedDates={highlightedDates}
        />
      </div>
    </div>
  );
};