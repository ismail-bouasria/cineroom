'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Film, MapPin, Users, ShoppingBag, Edit, X, Check } from 'lucide-react';
import { Booking, FORMULAS, CONSUMABLES, ReservationStatus } from '@/types';
import { useApiState } from '@/lib/hooks';
import { bookingsApi, isLoading, hasError, hasData } from '@/lib/api-client';
import { getImageUrl } from '@/lib/tmdb';

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/20' },
  modifiee: { label: 'Modifiée', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  annulee: { label: 'Annulée', color: 'text-red-400', bg: 'bg-red-500/20' },
  passee: { label: 'Passée', color: 'text-gray-400', bg: 'bg-gray-500/20' }
};

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [bookingState, setBookingState] = useApiState<Booking>();
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      const result = await bookingsApi.getById(resolvedParams.id);
      setBookingState(result);
    };
    fetchBooking();
  }, [resolvedParams.id, setBookingState]);

  const handleCancel = async () => {
    await bookingsApi.cancel(resolvedParams.id);
    router.push('/bookings?cancelled=true');
  };

  if (isLoading(bookingState)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin text-4xl">🎬</div>
      </div>
    );
  }

  if (hasError(bookingState) || !hasData(bookingState)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <Film className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h1 className="text-2xl font-bold mb-2">Réservation introuvable</h1>
          <Link href="/bookings" className="text-red-400 hover:underline">
            Retour aux réservations
          </Link>
        </div>
      </div>
    );
  }

  const booking = bookingState.data;
  const formula = FORMULAS.find(f => f.id === booking.formula);
  const status = statusConfig[booking.status];
  const isUpcoming = new Date(booking.date) >= new Date();
  const canModify = booking.status === 'active' && isUpcoming;

  const consumablesDetails = booking.consumables?.map(c => {
    const item = CONSUMABLES.find(cons => cons.id === c.consumableId);
    return item ? { ...item, quantity: c.quantity } : null;
  }).filter(Boolean) || [];

  const consumablesTotal = consumablesDetails.reduce(
    (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header avec backdrop */}
      <header className="relative h-64 md:h-80">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(booking.moviePoster ?? null, 'w780')}
            alt={booking.movieTitle ?? 'Film'}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 md:px-8 pt-8">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Mes réservations
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 -mt-32 relative z-10 pb-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
          {/* En-tête */}
          <div className="p-6 md:p-8 border-b border-white/10">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <div className="w-32 md:w-40 flex-shrink-0 mx-auto md:mx-0">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={getImageUrl(booking.moviePoster ?? null, 'w300')}
                    alt={booking.movieTitle ?? 'Film'}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <h1 className="text-2xl md:text-3xl font-black mt-3">{booking.movieTitle ?? 'Film'}</h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-gray-400">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {new Date(booking.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {booking.time}
                  </span>
                </div>

                {/* Formule */}
                <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-gradient-to-r ${formula?.color}`}>
                  <span className="text-xl">{formula?.icon}</span>
                  <span className="font-bold">{formula?.name}</span>
                  <span className="text-white/70">• {formula?.seats} places</span>
                  {booking.roomNumber && (
                    <span className="text-white/70">• Salle {booking.roomNumber}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Détails du prix */}
          <div className="p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-400" />
              Détail de la commande
            </h2>

            <div className="space-y-3">
              {/* Formule */}
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">
                  {formula?.name} ({formula?.seats} places)
                </span>
                <span className="font-medium">{formula?.basePrice}€</span>
              </div>

              {/* Consommables */}
              {consumablesDetails.map(item => item && (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-300">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center pt-4">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-black text-red-400">{booking.totalPrice}€</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canModify && (
            <div className="p-6 md:p-8 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/bookings/${booking.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
              >
                <Edit className="w-5 h-5" />
                Modifier la réservation
              </Link>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors"
              >
                <X className="w-5 h-5" />
                Annuler la réservation
              </button>
            </div>
          )}

          {/* Info création */}
          <div className="p-6 md:p-8 border-t border-white/10 text-sm text-gray-500">
            <p>Réservation créée le {new Date(booking.createdAt || '').toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p className="mt-1">Référence : #{booking.id}</p>
          </div>
        </div>
      </main>

      {/* Modal d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h2 className="text-xl font-bold mb-4">Annuler la réservation ?</h2>
            <p className="text-gray-400 mb-6">
              Cette action est irréversible. Votre réservation pour {booking.movieTitle} le{' '}
              {new Date(booking.date).toLocaleDateString('fr-FR')} sera annulée.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
              >
                Non, garder
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
