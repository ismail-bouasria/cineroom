'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TIME_SLOTS } from '@/types';

// ============================================
// TYPES
// ============================================

interface CalendarProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  minDate?: Date;
  maxDate?: Date;
  unavailableSlots?: { date: string; times: string[] }[];
}

interface DayInfo {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  dateString: string;
}

// ============================================
// HELPERS
// ============================================

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// ============================================
// COMPOSANT CALENDRIER
// ============================================

export function Calendar({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  minDate = new Date(),
  maxDate,
  unavailableSlots = []
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Générer les jours du mois
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);

    // Jour de la semaine du premier jour (0 = Dimanche, on veut Lundi = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: DayInfo[] = [];

    // Jours du mois précédent
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        isPast: date < today,
        isSelected: selectedDate === formatDateString(date),
        dateString: formatDateString(date)
      });
    }

    // Jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isPast: date < today,
        isSelected: selectedDate === formatDateString(date),
        dateString: formatDateString(date)
      });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        isPast: false,
        isSelected: selectedDate === formatDateString(date),
        dateString: formatDateString(date)
      });
    }

    return days;
  }, [currentMonth, selectedDate, today]);

  // Créneaux disponibles pour la date sélectionnée
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const unavailable = unavailableSlots.find(s => s.date === selectedDate)?.times || [];
    const selectedDateObj = new Date(selectedDate);
    const isToday = isSameDay(selectedDateObj, today);
    const currentHour = new Date().getHours();

    return TIME_SLOTS.map(time => {
      const hour = parseInt(time.split(':')[0]);
      const isPast = isToday && hour <= currentHour;
      const isUnavailable = unavailable.includes(time) || isPast;

      return {
        time,
        available: !isUnavailable
      };
    });
  }, [selectedDate, unavailableSlots, today]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const canGoPrevious = () => {
    const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return firstOfMonth > minDate;
  };

  return (
    <div className="w-full">
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious()}
          className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={24} />
        </button>
        
        <h3 className="text-xl font-bold">
          {MONTHS_FR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_FR.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          const isDisabled = dayInfo.isPast || !dayInfo.isCurrentMonth;
          
          return (
            <button
              key={index}
              onClick={() => !isDisabled && onDateSelect(dayInfo.dateString)}
              disabled={isDisabled}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${dayInfo.isSelected
                  ? 'bg-red-600 text-white ring-2 ring-red-400'
                  : dayInfo.isToday
                    ? 'bg-white/20 text-white'
                    : dayInfo.isCurrentMonth
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-600'
                }
                ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-label={`Sélectionner le ${dayInfo.day}`}
            >
              {dayInfo.day}
              {dayInfo.isToday && !dayInfo.isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Créneaux horaires */}
      {selectedDate && (
        <div className="mt-8 pb-4">
          <h4 className="text-lg font-semibold mb-4">
            Choisissez un créneau
          </h4>
          
          {availableTimeSlots.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Aucun créneau disponible pour cette date
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {availableTimeSlots.map(({ time, available }) => (
                <button
                  key={time}
                  onClick={() => available && onTimeSelect(time)}
                  disabled={!available}
                  className={`
                    py-3 px-2 rounded-lg text-sm font-medium transition-all
                    ${selectedTime === time
                      ? 'bg-red-600 text-white ring-2 ring-red-400'
                      : available
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                        : 'bg-white/5 text-gray-600 cursor-not-allowed line-through'
                    }
                  `}
                  aria-label={`Sélectionner ${time}`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPOSANT MINI CALENDRIER (pour les cards)
// ============================================

export function MiniCalendar({
  selectedDate,
  onDateSelect,
  minDate = new Date()
}: {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  minDate?: Date;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Générer les 7 prochains jours
  const nextDays = useMemo(() => {
    const days: { date: Date; dateString: string; dayName: string; dayNum: number }[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      
      days.push({
        date,
        dateString: formatDateString(date),
        dayName: i === 0 ? "Auj." : dayNames[date.getDay()],
        dayNum: date.getDate()
      });
    }
    
    return days;
  }, [today]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {nextDays.map(({ dateString, dayName, dayNum }) => (
        <button
          key={dateString}
          onClick={() => onDateSelect(dateString)}
          className={`
            flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl transition-all
            ${selectedDate === dateString
              ? 'bg-red-600 text-white ring-2 ring-red-400'
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
          `}
        >
          <span className="text-xs font-medium opacity-80">{dayName}</span>
          <span className="text-xl font-bold">{dayNum}</span>
        </button>
      ))}
    </div>
  );
}

export default Calendar;
