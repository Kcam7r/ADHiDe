import React from 'react';

export const JournalAnalysis: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Analiza Dziennika</h2>
      <p className="text-gray-300">Tutaj znajdzie się analiza Twoich wpisów w dzienniku.</p>
      <p className="text-sm text-gray-400 mt-2">W przyszłości: wykresy nastroju i energii, chmura słów kluczowych, korelacje.</p>
    </div>
  );
};