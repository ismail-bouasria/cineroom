'use client';

import { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, Check, Loader2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface TimeSlotInfo {
  time: string;
  isAvailable: boolean;
  availableRooms: number;
  totalRooms: number;
  bookedRooms: number[];
}

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedFormula: string;
  onSelectTimeSlot: (time: string, roomNumber: number) => void;
  currentTime?: string | null;
  currentRoom?: number | null;
}

// ============================================
// GRAPHQL QUERY
// ============================================

async function fetchAvailableTimeSlots(
  date: string,
  formula: string
): Promise<TimeSlotInfo[]> {
  const query = `
    query GetAvailableTimeSlots($date: String!, $formula: String!) {
      getAvailableTimeSlots(date: $date, formula: $formula) {
        time
        isAvailable
        availableRooms
        totalRooms
        bookedRooms
      }
    }
  `;

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { date, formula } }),
  });

  const result = await response.json();
  
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  return result.data.getAvailableTimeSlots;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTime(time: string): string {
  return time.replace(':', 'h');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getFormulaDisplayName(formula: string): string {
  switch (formula) {
    case 'cine_duo': return 'CinéDuo';
    case 'cine_team': return 'CinéTeam';
    case 'cine_groupe': return 'CinéGroupe';
    default: return formula;
  }
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function TimeSlotModal({
  isOpen,
  onClose,
  selectedDate,
  selectedFormula,
  onSelectTimeSlot,
  currentTime,
  currentRoom
}: TimeSlotModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlotInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(currentTime || null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(currentRoom || null);

  useEffect(() => {
    if (!isOpen || !selectedDate || !selectedFormula) return;

    const loadTimeSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const slots = await fetchAvailableTimeSlots(selectedDate, selectedFormula);
        setTimeSlots(slots);
      } catch (err) {
        console.error('Error loading time slots:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [isOpen, selectedDate, selectedFormula]);

  useEffect(() => {
    setSelectedSlot(currentTime || null);
    setSelectedRoom(currentRoom || null);
  }, [currentTime, currentRoom]);

  if (!isOpen) return null;

  const handleSelectSlot = (time: string) => {
    setSelectedSlot(time);
    setSelectedRoom(null);
  };

  const handleSelectRoom = (roomNumber: number) => {
    if (!selectedSlot) return;
    setSelectedRoom(roomNumber);
  };

  const handleConfirm = () => {
    if (selectedSlot && selectedRoom) {
      onSelectTimeSlot(selectedSlot, selectedRoom);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentSlotData = timeSlots.find(s => s.time === selectedSlot);
  const formulaName = getFormulaDisplayName(selectedFormula);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl mx-4 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Choisissez votre créneau et salle</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDate(selectedDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Chargement des créneaux...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Time Slots */}
          {!loading && !error && (
            <div className="space-y-4">
              {/* Créneaux horaires */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Créneaux disponibles</h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    const isFull = !slot.isAvailable;
                    
                    return (
                      <button
                        key={slot.time}
                        onClick={() => !isFull && handleSelectSlot(slot.time)}
                        disabled={isFull}
                        className={`
                          relative py-3 px-2 rounded-lg text-center transition-all
                          ${isFull 
                            ? 'bg-white/[0.02] border border-white/5 text-gray-600 cursor-not-allowed'
                            : isSelected
                              ? 'bg-white/10 border border-white/20 text-white'
                              : 'bg-white/[0.03] border border-white/5 text-gray-300 hover:bg-white/[0.06] hover:border-white/10'
                          }
                        `}
                      >
                        <div className="font-medium text-sm">{formatTime(slot.time)}</div>
                        <div className={`text-[10px] mt-0.5 ${isFull ? 'text-gray-600' : 'text-gray-500'}`}>
                          {isFull ? 'Complet' : `${slot.availableRooms} dispo`}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-black" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sélection de salle */}
              {selectedSlot && currentSlotData && (
                <div className="mt-6 pt-5 border-t border-white/5">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Choisissez votre salle • {formatTime(selectedSlot)}
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((roomNum) => {
                      const isBooked = currentSlotData.bookedRooms?.includes(roomNum) ?? false;
                      const isSelected = selectedRoom === roomNum;
                      
                      return (
                        <button
                          key={roomNum}
                          onClick={() => !isBooked && handleSelectRoom(roomNum)}
                          disabled={isBooked}
                          className={`
                            relative p-3 rounded-lg transition-all text-center
                            ${isBooked 
                              ? 'bg-white/[0.02] border border-white/5 cursor-not-allowed'
                              : isSelected
                                ? 'bg-red-500/20 border border-red-500/40 text-white'
                                : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                            }
                          `}
                        >
                          <div className={`text-xs font-medium ${isBooked ? 'text-gray-600' : isSelected ? 'text-red-300' : 'text-gray-300'}`}>
                            {formulaName}
                          </div>
                          <div className={`text-lg font-bold ${isBooked ? 'text-gray-600' : isSelected ? 'text-white' : 'text-white'}`}>
                            {roomNum}
                          </div>
                          {isBooked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <X className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Légende */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-white/[0.03] border border-white/5"></div>
                      <span>Disponible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40"></div>
                      <span>Sélectionné</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-white/[0.02] border border-white/5 relative">
                        <X className="w-2 h-2 text-gray-600 absolute inset-0 m-auto" />
                      </div>
                      <span>Réservé</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {timeSlots.length === 0 && (
                <div className="text-center py-16">
                  <Clock className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun créneau disponible</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-[#151515]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedSlot && selectedRoom ? (
                <span className="text-gray-300">
                  {formatTime(selectedSlot)} • {formulaName} {selectedRoom}
                </span>
              ) : selectedSlot ? (
                <span>Sélectionnez une salle</span>
              ) : (
                <span>Sélectionnez un créneau</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedSlot || !selectedRoom}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeSlotModal;
