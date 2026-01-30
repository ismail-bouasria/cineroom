'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, Film, ArrowLeft, Ticket, Check, X, Edit, Filter } from 'lucide-react';
import { Booking, FORMULAS, ReservationStatus } from '@/types';
import { useApiState } from '@/lib/hooks';
import { bookingsApi, isLoading, hasError, hasData } from '@/lib/api-client';
import { getImageUrl } from '@/lib/tmdb';
import { Suspense } from 'react';

// ============================================
// COMPOSANTS
// ============================================

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/20' },
  modifiee: { label: 'Modifiée', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  annulee: { label: 'Annulée', color: 'text-red-400', bg: 'bg-red-500/20' },
  passee: { label: 'Passée', color: 'text-gray-400', bg: 'bg-gray-500/20' }
};

const BookingCard = ({ 
  booking, 
  onCancel 
}: { 
  booking: Booking; 
  onCancel: (id: string) => void;
}) => {
  const formula = FORMULAS.find(f => f.id === booking.formula);
  const status = statusConfig[booking.status];
  
  // Vérifier si la réservation peut être modifiée (règle des 2h avant)
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  const now = new Date();
  const twoHoursInMs = 2 * 60 * 60 * 1000;
  const timeUntilBooking = bookingDateTime.getTime() - now.getTime();
  const isWithinTwoHours = timeUntilBooking >= 0 && timeUntilBooking < twoHoursInMs;
  const isPast = timeUntilBooking < 0;
  
  const canModify = (booking.status === 'active' || booking.status === 'modifiee') && !isPast && !isWithinTwoHours;
  const showTimeWarning = (booking.status === 'active' || booking.status === 'modifiee') && isWithinTwoHours;

  // Formatter le temps restant
  const formatTimeRemaining = () => {
    if (timeUntilBooking < 0) return null;
    const hours = Math.floor(timeUntilBooking / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilBooking % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes} minutes`;
  };

  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors">
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="w-full sm:w-32 h-40 sm:h-auto relative flex-shrink-0">
          {booking.moviePoster ? (
            <Image
              src={getImageUrl(booking.moviePoster, 'w300')}
              alt={booking.movieTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Film className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                {status.label}
              </span>
              <h3 className="text-xl font-bold mt-2">{booking.movieTitle}</h3>
            </div>
            <p className="text-2xl font-bold text-white">{booking.totalPrice}€</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(booking.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {booking.time}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${formula?.color || 'from-gray-500 to-gray-600'}`}>
              <span>{formula?.icon}</span>
              {formula?.name || booking.formula}
            </span>
            <span className="text-sm text-gray-400">
              {formula?.seats} places
            </span>
            {booking.roomNumber && (
              <span className="text-sm text-gray-400">
                • Salle {booking.roomNumber}
              </span>
            )}
          </div>

          {/* Warning pour les 2h */}
          {showTimeWarning && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Séance dans {formatTimeRemaining()} - La modification n&apos;est plus possible
              </p>
            </div>
          )}

          {/* Actions */}
          {canModify && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <Link
                href={`/bookings/${booking.id}/edit`}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
              <button
                onClick={() => onCancel(booking.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// PAGE
// ============================================

function BookingsContent() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('success') === 'true';
  
  const [bookingsState, setBookingsState] = useApiState<Booking[]>();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      const result = await bookingsApi.getAll();
      setBookingsState(result);
    };
    fetchBookings();
  }, [setBookingsState]);

  const handleCancel = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      await bookingsApi.cancel(id);
      const result = await bookingsApi.getAll();
      setBookingsState(result);
    }
  };

  const allBookings = hasData(bookingsState) ? bookingsState.data : [];
  
  const filteredBookings = allBookings.filter(booking => {
    const isUpcoming = new Date(booking.date) >= new Date();
    
    if (filter === 'upcoming' && !isUpcoming) return false;
    if (filter === 'past' && isUpcoming) return false;
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-red-950/30 to-transparent py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-black">Mes Réservations</h1>
          <p className="text-gray-400 mt-1">Gérez vos réservations de salles privées</p>
        </div>
      </header>

      {/* Success message */}
      {showSuccess && (
        <div className="max-w-4xl mx-auto px-4 md:px-8 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-green-400 font-medium">Votre réservation a été confirmée avec succès !</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
            {(['all', 'upcoming', 'past'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                    : 'hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'Toutes' : f === 'upcoming' ? 'À venir' : 'Passées'}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="modifiee">Modifiée</option>
            <option value="annulee">Annulée</option>
            <option value="passee">Passée</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 pb-12">
        {isLoading(bookingsState) && (
          <div className="flex justify-center py-20">
            <div className="animate-spin text-4xl">🎬</div>
          </div>
        )}

        {hasError(bookingsState) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{bookingsState.error}</p>
          </div>
        )}

        {hasData(bookingsState) && filteredBookings.length === 0 && (
          <div className="bg-white/5 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucune réservation</h3>
            <p className="text-gray-400 mb-6">
              {filter === 'upcoming' 
                ? "Vous n'avez pas de réservation à venir"
                : filter === 'past'
                  ? "Vous n'avez pas encore de réservation passée"
                  : "Commencez par réserver votre première séance"
              }
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full font-medium"
            >
              <Ticket className="w-5 h-5" />
              Réserver maintenant
            </Link>
          </div>
        )}

        {filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin text-4xl">🎬</div>
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}
