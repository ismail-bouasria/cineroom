'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, Save, X, ShoppingBag, AlertCircle } from 'lucide-react';
import { Booking, FORMULAS, CONSUMABLES } from '@/types';
import { useApiState } from '@/lib/hooks';
import { bookingsApi, hasData, isLoading, hasError } from '@/lib/api-client';
import { getImageUrl } from '@/lib/tmdb';
import { Calendar as CalendarComponent } from '@/components/booking/Calendar';
import { ConsumableSelector, ConsumableSelection } from '@/components/booking/ConsumableSelector';

// ============================================
// PAGE MODIFICATION DE RÉSERVATION
// ============================================

export default function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [bookingState, setBookingState] = useApiState<Booking>();
  const [activeTab, setActiveTab] = useState<'datetime' | 'consumables'>('datetime');
  
  // État du formulaire
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consumables, setConsumables] = useState<ConsumableSelection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger la réservation
  useEffect(() => {
    const fetchBooking = async () => {
      const result = await bookingsApi.getById(id);
      setBookingState(result);
      
      if (hasData(result) && result.data) {
        setSelectedDate(result.data.date);
        setSelectedTime(result.data.time);
        // Convertir les consommables existants
        if (result.data.consumables) {
          setConsumables(result.data.consumables.map(c => ({
            consumableId: c.consumableId,
            quantity: c.quantity
          })));
        }
      }
    };
    fetchBooking();
  }, [id, setBookingState]);

  const booking = hasData(bookingState) ? bookingState.data : null;
  const formula = booking ? FORMULAS.find(f => f.id === booking.formula) : null;

  // Calculer le nouveau prix total
  const calculateTotal = () => {
    if (!formula) return 0;
    
    let total = formula.basePrice;
    
    consumables.forEach(selection => {
      const consumable = CONSUMABLES.find(c => c.id === selection.consumableId);
      if (consumable) {
        total += consumable.price * selection.quantity;
      }
    });
    
    return total;
  };

  // Vérifier si des modifications ont été faites
  const hasChanges = () => {
    if (!booking) return false;
    
    const dateChanged = selectedDate !== booking.date;
    const timeChanged = selectedTime !== booking.time;
    const consumablesChanged = JSON.stringify(consumables) !== JSON.stringify(booking.consumables || []);
    
    return dateChanged || timeChanged || consumablesChanged;
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!booking || !selectedDate || !selectedTime) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updatedBooking: Partial<Booking> = {
        date: selectedDate,
        time: selectedTime,
        consumables: consumables.map(c => {
          const consumable = CONSUMABLES.find(item => item.id === c.consumableId);
          return {
            consumableId: c.consumableId,
            name: consumable?.name || '',
            quantity: c.quantity,
            unitPrice: consumable?.price || 0
          };
        }),
        totalPrice: calculateTotal(),
        status: 'modifiee'
      };
      
      // L'email est récupéré automatiquement depuis Clerk côté serveur
      const result = await bookingsApi.update(id, updatedBooking);
      
      if (hasData(result)) {
        router.push(`/bookings/${id}?updated=true`);
      } else if (hasError(result)) {
        setError(result.error || 'Erreur lors de la modification');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  // États de chargement et erreur
  if (isLoading(bookingState)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin text-4xl">🎬</div>
      </div>
    );
  }

  if (hasError(bookingState) || !booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Réservation introuvable</h1>
          <p className="text-gray-400 mb-6">Cette réservation n&apos;existe pas ou a été supprimée.</p>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux réservations
          </Link>
        </div>
      </div>
    );
  }

  // Vérifier si la réservation peut être modifiée
  if (booking.status === 'annulee' || booking.status === 'passee') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <X className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Modification impossible</h1>
          <p className="text-gray-400 mb-6">
            Cette réservation est {booking.status === 'annulee' ? 'annulée' : 'passée'} et ne peut plus être modifiée.
          </p>
          <Link
            href={`/bookings/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux détails
          </Link>
        </div>
      </div>
    );
  }

  // Vérifier la condition 2h avant la séance
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  const now = new Date();
  const twoHoursInMs = 2 * 60 * 60 * 1000;
  const timeUntilBooking = bookingDateTime.getTime() - now.getTime();
  const isWithinTwoHours = timeUntilBooking >= 0 && timeUntilBooking < twoHoursInMs;

  if (isWithinTwoHours) {
    const hoursRemaining = Math.floor(timeUntilBooking / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeUntilBooking % (1000 * 60 * 60)) / (1000 * 60));
    
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Modification impossible</h1>
          <p className="text-gray-400 mb-2">
            Votre séance commence dans {hoursRemaining > 0 ? `${hoursRemaining}h ` : ''}{minutesRemaining} minutes.
          </p>
          <p className="text-gray-400 mb-6">
            Les réservations ne peuvent être modifiées que jusqu&apos;à 2 heures avant le début de la séance.
          </p>
          <Link
            href={`/bookings/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux détails
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link
            href={`/bookings/${id}`}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Annuler</span>
          </Link>
          
          <h1 className="font-bold">Modifier la réservation</h1>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges() || isSaving || !selectedDate || !selectedTime}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Enregistrer</span>
          </button>
        </div>
      </header>

      {/* Erreur */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 md:px-8 mt-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Résumé de la réservation */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-16 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={getImageUrl(booking.moviePoster ?? null, 'w200')}
              alt={booking.movieTitle ?? 'Film'}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{booking.movieTitle}</h2>
            <p className="text-gray-400 text-sm">{formula?.name} • {formula?.seats} places</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(selectedDate || booking.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedTime || booking.time}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{calculateTotal()}€</p>
            {calculateTotal() !== booking.totalPrice && (
              <p className="text-sm text-gray-500 line-through">{booking.totalPrice}€</p>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('datetime')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'datetime'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Date & Heure
          </button>
          <button
            onClick={() => setActiveTab('consumables')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'consumables'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Consommables
          </button>
        </div>
      </div>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {activeTab === 'datetime' && (
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Changer la date et l&apos;heure</h3>
            <CalendarComponent
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
            />
          </div>
        )}

        {activeTab === 'consumables' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Modifier les consommables</h3>
            <ConsumableSelector
              selections={consumables}
              onChange={setConsumables}
            />
          </div>
        )}
      </main>

      {/* Barre d'action mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/10 p-4 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">Nouveau total</p>
            <p className="text-xl font-bold">{calculateTotal()}€</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges() || isSaving || !selectedDate || !selectedTime}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-medium transition-colors"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Espace pour la barre mobile */}
      <div className="h-24 md:hidden" />
    </div>
  );
}
