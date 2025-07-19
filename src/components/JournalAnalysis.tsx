import React from 'react';
import { useApp } from '../contexts/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';

export const JournalAnalysis: React.FC = () => {
  const { journalEntries } = useApp();

  // Przygotowanie danych dla wykresów
  const chartData = React.useMemo(() => {
    const dailyDataMap = new Map<string, { moodSum: number; energySum: number; count: number }>();

    journalEntries.forEach(entry => {
      const dateKey = format(new Date(entry.date), 'yyyy-MM-dd');
      if (!dailyDataMap.has(dateKey)) {
        dailyDataMap.set(dateKey, { moodSum: 0, energySum: 0, count: 0 });
      }
      const data = dailyDataMap.get(dateKey)!;
      data.moodSum += entry.mood;
      data.energySum += entry.energy;
      data.count += 1;
    });

    const sortedDates = Array.from(dailyDataMap.keys()).sort();

    return sortedDates.map(dateKey => {
      const data = dailyDataMap.get(dateKey)!;
      return {
        date: dateKey,
        mood: data.moodSum / data.count,
        energy: data.energySum / data.count,
      };
    });
  }, [journalEntries]);

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-white text-center">
        <h2 className="text-xl font-semibold mb-4">Analiza Dziennika</h2>
        <p className="text-gray-300">Brak wystarczających danych do wygenerowania wykresów.</p>
        <p className="text-sm text-gray-400 mt-2">Dodaj więcej wpisów do dziennika, aby zobaczyć trendy nastroju i energii.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-6">Analiza Dziennika</h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Trend Nastroju</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" /> {/* gray-600 */}
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => format(new Date(tick), 'dd.MM', { locale: pl })}
              stroke="#9ca3af" // gray-400
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              stroke="#9ca3af" // gray-400
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }} // gray-700
              labelStyle={{ color: '#e5e7eb' }} // gray-200
              itemStyle={{ color: '#e5e7eb' }} // gray-200
              formatter={(value: number, name: string, props: any) => [`${value.toFixed(1)}`, 'Nastrój']}
              labelFormatter={(label: string) => `Data: ${format(new Date(label), 'dd.MM.yyyy', { locale: pl })}`}
            />
            <Line type="monotone" dataKey="mood" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /> {/* green-400 */}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Trend Energii</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" /> {/* gray-600 */}
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => format(new Date(tick), 'dd.MM', { locale: pl })}
              stroke="#9ca3af" // gray-400
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              stroke="#9ca3af" // gray-400
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }} // gray-700
              labelStyle={{ color: '#e5e7eb' }} // gray-200
              itemStyle={{ color: '#e5e7eb' }} // gray-200
              formatter={(value: number, name: string, props: any) => [`${value.toFixed(1)}`, 'Energia']}
              labelFormatter={(label: string) => `Data: ${format(new Date(label), 'dd.MM.yyyy', { locale: pl })}`}
            />
            <Line type="monotone" dataKey="energy" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} /> {/* blue-400 */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};