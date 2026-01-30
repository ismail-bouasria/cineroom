'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, Film, ArrowLeft, Ticket, Check, X, Edit, Filter, Trash2 } from 'lucide-react';
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
  onCancel,
  onDelete
}: { 
  booking: Booking; 
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
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
  const canDelete = booking.status === 'annulee';
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
    <div className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors relative">
      {/* Bouton Supprimer en haut à droite (seulement pour les réservations annulées) */}
      {canDelete && (
        <button
          onClick={() => onDelete(booking.id)}
          className="absolute top-3 right-3 z-10 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-lg transition-colors"
          title="Supprimer définitivement"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      
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
// MODAL DE CONFIRMATION
// ============================================

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText, 
  cancelText = 'Annuler',
  variant = 'danger',
  onConfirm, 
  onCancel,
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-500/20 text-red-400',
      button: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: 'bg-orange-500/20 text-orange-400',
      button: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full ${styles.icon} flex items-center justify-center mx-auto mb-4`}>
          <X className="w-6 h-6" />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
        <p className="text-gray-400 text-center mb-6">{message}</p>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 ${styles.button} rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Chargement...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE
// ============================================

function BookingsContent() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('success') === 'true';
  
  const [bookingsState, setBookingsState] = useApiState<Booking[]>();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  
  // États pour les modals de confirmation
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; bookingId: string | null }>({
    isOpen: false,
    bookingId: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; bookingId: string | null }>({
    isOpen: false,
    bookingId: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      const result = await bookingsApi.getAll();
      setBookingsState(result);
    };
    fetchBookings();
  }, [setBookingsState]);

  const handleCancelClick = (id: string) => {
    setCancelModal({ isOpen: true, bookingId: id });
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal.bookingId) return;
    
    setIsProcessing(true);
    try {
      await bookingsApi.cancel(cancelModal.bookingId);
      const result = await bookingsApi.getAll();
      setBookingsState(result);
    } finally {
      setIsProcessing(false);
      setCancelModal({ isOpen: false, bookingId: null });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, bookingId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.bookingId) return;
    
    setIsProcessing(true);
    try {
      await bookingsApi.delete(deleteModal.bookingId);
      const result = await bookingsApi.getAll();
      setBookingsState(result);
    } finally {
      setIsProcessing(false);
      setDeleteModal({ isOpen: false, bookingId: null });
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
                onCancel={handleCancelClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de confirmation d'annulation */}
      <ConfirmModal
        isOpen={cancelModal.isOpen}
        title="Annuler la réservation"
        message="Êtes-vous sûr de vouloir annuler cette réservation ? Vous pourrez la supprimer définitivement ensuite."
        confirmText="Oui, annuler"
        cancelText="Non, garder"
        variant="warning"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelModal({ isOpen: false, bookingId: null })}
        isLoading={isProcessing}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Supprimer définitivement"
        message="Cette action est irréversible. La réservation sera définitivement supprimée de votre historique."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, bookingId: null })}
        isLoading={isProcessing}
      />
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
