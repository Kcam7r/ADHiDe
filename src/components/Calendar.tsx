import React, { useState, useEffect, useRef } from 'react';
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
  setMonth,
  setYear,
} from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  highlightedDates?: Date[];
  onClose: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, highlightedDates = [], onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Obsługa kliknięcia poza kalendarzem
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Calculate leading empty days for the grid (Monday = 0 in getDay, but we want Monday = 1)
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayIndex = (getDay(firstDayOfMonth) + 6) % 7; // Adjust to make Monday 0, Tuesday 1, etc.

  const days: (Date | null)[] = Array.from({ length: startingDayIndex }, () => null).concat(daysInMonth);

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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonthIndex = parseInt(e.target.value, 10);
    setCurrentMonth(prev => setMonth(prev, newMonthIndex));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentMonth(prev => setYear(prev, newYear));
  };

  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i); // 20 lat wstecz, bieżący, 20 lat w przód

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2000, i, 1), 'MMMM', { locale: pl }),
  }));

  return (
    <div ref={calendarRef} className="bg-gray-800 rounded-lg p-6 shadow-lg text-white w-full max-w-sm border border-gray-700">
      {/* Header with month and year selectors */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        </button>
        <div className="flex space-x-2">
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            className="bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            className="bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-400 mb-2">
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
              relative flex items-center justify-center rounded-md text-sm cursor-pointer
              aspect-square h-10
              ${day && isSameMonth(day, currentMonth) ? 'text-white' : 'text-gray-500 opacity-60'}
              ${day && isSameDay(day, selectedDate) ? 'bg-cyan-600 text-white font-bold' : 'hover:bg-gray-700'}
              group
            `}
            onClick={() => day && onSelectDate(day)}
          >
            {day && format(day, 'd')}
            {day && isDateHighlighted(day) && (
              <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></div>
            )}
            {/* Subtle border on hover */}
            <div className="absolute inset-0 border border-transparent group-hover:border-gray-600 rounded-md transition-colors duration-100 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};