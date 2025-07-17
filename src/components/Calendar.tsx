import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  highlightedDates?: Date[];
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, highlightedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Calculate leading empty days for the grid (Monday = 0 in getDay, but we want Monday = 1)
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayIndex = (getDay(firstDayOfMonth) + 6) % 7; // Adjust to make Monday 0, Tuesday 1, etc.

  const days = Array.from({ length: startingDayIndex }, () => null).concat(daysInMonth);

  const weekdays = ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'];

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDateHighlighted = (date: Date) => {
    return highlightedDates.some(highlightedDate => isSameDay(highlightedDate, date));
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg text-gray-800 w-full max-w-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-center">
          {format(currentMonth, 'MMMM yyyy', { locale: pl })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
        {weekdays.map((day, index) => (
          <div key={index} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              relative h-10 flex items-center justify-center rounded-md text-sm cursor-pointer
              ${day && isSameMonth(day, currentMonth) ? 'text-gray-800' : 'text-gray-400 opacity-60'}
              ${day && isSameDay(day, selectedDate) ? 'bg-blue-500 text-white font-bold' : 'hover:bg-gray-100'}
              ${day && isDateHighlighted(day) && !isSameDay(day, selectedDate) ? 'bg-blue-100 text-blue-700 font-medium' : ''}
              
              group
            `}
            onClick={() => day && onSelectDate(day)}
          >
            {day && format(day, 'd')}
            {/* Subtle border on hover */}
            <div className="absolute inset-0 border border-transparent group-hover:border-gray-300 rounded-md transition-colors duration-100 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};