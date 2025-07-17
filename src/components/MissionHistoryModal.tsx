import React from 'react';
import { X, Clock, Star, Flame } from 'lucide-react';
import { Mission } from '../types';

interface MissionHistoryModalProps {
  missions: Mission[];
  onClose: () => void;
}

export const MissionHistoryModal: React.FC<MissionHistoryModalProps> = ({ missions, onClose }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'important':
        return <Star className="w-4 h-4 text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center space-x-2">
            <span>📜</span>
            <span>Historia Misji</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {missions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <p>Brak ukończonych misji.</p>
              <p className="text-sm mt-2">Ukończ swoje pierwsze zadanie, aby zobaczyć historię!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getPriorityIcon(mission.priority)}
                        <h4 className="text-white font-medium">{mission.title}</h4>
                      </div>
                      {mission.description && (
                        <p className="text-gray-300 text-sm mb-2">{mission.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(mission.completedAt!)}</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                          {mission.priority}
                        </span>
                        <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                          {mission.energy}
                        </span>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl ml-4">
                      ✓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};