'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, ArrowRight, Check, Film, Calendar as CalendarIcon, 
  Users, ShoppingBag, CreditCard, Star, Clock, Ticket
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { TMDBMovie, FORMULAS, FormulaConfig, CONSUMABLES } from '@/types';
import { getImageUrl, MOCK_MOVIES } from '@/lib/tmdb';
import { Calendar } from '@/components/booking/Calendar';
import { ConsumableSelector, ConsumableSelection, ConsumableSummary } from '@/components/booking/ConsumableSelector';

// ============================================
// TYPES
// ============================================

interface BookingState {
  movie: TMDBMovie | null;
  formula: FormulaConfig | null;
  date: string | null;
  time: string | null;
  consumables: ConsumableSelection[];
}

type Step = 'movie' | 'formula' | 'datetime' | 'consumables' | 'summary';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'movie', label: 'Film', icon: <Film size={18} /> },
  { id: 'formula', label: 'Formule', icon: <Users size={18} /> },
  { id: 'datetime', label: 'Date & Heure', icon: <CalendarIcon size={18} /> },
  { id: 'consumables', label: 'Consommables', icon: <ShoppingBag size={18} /> },
  { id: 'summary', label: 'Confirmation', icon: <CreditCard size={18} /> }
];

// ============================================
// COMPOSANT SÉLECTION FILM
// ============================================

function MovieSelection({ 
  selectedMovie, 
  onSelect 
}: { 
  selectedMovie: TMDBMovie | null; 
  onSelect: (movie: TMDBMovie) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const movies = MOCK_MOVIES;
  
  const filteredMovies = searchQuery 
    ? movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : movies;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choisissez votre film</h2>
        <p className="text-gray-400">Sélectionnez le film que vous souhaitez regarder dans votre salle privée</p>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un film..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-red-500 focus:outline-none transition-colors placeholder:text-gray-500"
        />
      </div>

      {/* Grille de films */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMovies.map(movie => (
          <button
            key={movie.id}
            onClick={() => onSelect(movie)}
            className={`
              relative group overflow-hidden rounded-xl transition-all
              ${selectedMovie?.id === movie.id 
                ? 'ring-2 ring-red-500 scale-105' 
                : 'hover:scale-105'
              }
            `}
          >
            <div className="aspect-[2/3] relative">
              <Image
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
              
              {/* Overlay */}
              <div className={`
                absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                ${selectedMovie?.id === movie.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                transition-opacity
              `}>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-sm line-clamp-2">{movie.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Check si sélectionné */}
              {selectedMovie?.id === movie.id && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Check size={18} />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT SÉLECTION FORMULE
// ============================================

function FormulaSelection({
  selectedFormula,
  onSelect
}: {
  selectedFormula: FormulaConfig | null;
  onSelect: (formula: FormulaConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choisissez votre formule</h2>
        <p className="text-gray-400">Sélectionnez la formule adaptée à votre groupe</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {FORMULAS.map(formula => (
          <button
            key={formula.id}
            onClick={() => onSelect(formula)}
            className={`
              relative overflow-hidden rounded-2xl p-6 text-left transition-all border
              ${selectedFormula?.id === formula.id
                ? 'ring-2 ring-red-500 border-red-500'
                : 'border-white/10 hover:border-white/30'
              }
              bg-gradient-to-br ${formula.color}
            `}
          >
            {formula.popular && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-red-600/80 backdrop-blur-sm rounded-full text-xs font-medium">
                ★ Populaire
              </div>
            )}
            
            {selectedFormula?.id === formula.id && (
              <div className="absolute top-4 left-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}

            <div className="text-4xl mb-4">{formula.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{formula.name}</h3>
            <p className="text-white/70 mb-4">{formula.description}</p>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">{formula.basePrice}€</span>
              <span className="text-white/50">/ séance</span>
            </div>
            
            <div className="flex items-center gap-2 text-white/70">
              <Users size={18} />
              <span>{formula.seats} places</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT DATE/HEURE
// ============================================

function DateTimeSelection({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect
}: {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choisissez la date et l&apos;heure</h2>
        <p className="text-gray-400">Sélectionnez le créneau qui vous convient</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white/5 rounded-2xl p-6">
        <Calendar
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateSelect={onDateSelect}
          onTimeSelect={onTimeSelect}
        />
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT CONSOMMABLES
// ============================================

function ConsumablesSelection({
  selections,
  onChange
}: {
  selections: ConsumableSelection[];
  onChange: (selections: ConsumableSelection[]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ajoutez des consommables</h2>
        <p className="text-gray-400">Complétez votre expérience avec nos snacks et boissons</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <ConsumableSelector
          selections={selections}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT RÉCAPITULATIF
// ============================================

function BookingSummary({
  booking,
  onConfirm,
  isLoading
}: {
  booking: BookingState;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const consumablesTotal = booking.consumables.reduce((sum, s) => {
    const consumable = CONSUMABLES.find(c => c.id === s.consumableId);
    return sum + (consumable?.price || 0) * s.quantity;
  }, 0);

  const total = (booking.formula?.basePrice || 0) + consumablesTotal;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Récapitulatif de votre réservation</h2>
        <p className="text-gray-400">Vérifiez les détails avant de confirmer</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Film */}
        {booking.movie && (
          <div className="bg-white/5 rounded-xl p-4 flex gap-4">
            <div className="w-20 h-28 relative flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(booking.movie.poster_path, 'w200')}
                alt={booking.movie.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Film</span>
              <h3 className="text-xl font-bold mt-1">{booking.movie.title}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span>{booking.movie.vote_average.toFixed(1)}</span>
                <span>•</span>
                <span>{new Date(booking.movie.release_date).getFullYear()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Formule */}
        {booking.formula && (
          <div className={`rounded-xl p-4 bg-gradient-to-r ${booking.formula.color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{booking.formula.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{booking.formula.name}</h3>
                  <p className="text-sm text-white/70">{booking.formula.seats} places</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{booking.formula.basePrice}€</span>
            </div>
          </div>
        )}

        {/* Date et heure */}
        {booking.date && booking.time && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CalendarIcon size={24} className="text-red-400" />
              <div>
                <h4 className="font-semibold capitalize">{formatDate(booking.date)}</h4>
                <p className="text-gray-400 flex items-center gap-2">
                  <Clock size={14} />
                  <span>{booking.time}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Consommables */}
        <ConsumableSummary selections={booking.consumables} />

        {/* Total */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-400">Total à payer</span>
              <p className="text-3xl font-black">{total.toFixed(2)}€</p>
            </div>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-full font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Ticket size={24} />
              )}
              {isLoading ? 'Confirmation...' : 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE PRINCIPALE
// ============================================

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>('movie');
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    movie: null,
    formula: null,
    date: null,
    time: null,
    consumables: []
  });

  // Pré-remplir depuis les query params
  useEffect(() => {
    const movieId = searchParams.get('movie');
    const formulaId = searchParams.get('formula');

    if (movieId) {
      const movie = MOCK_MOVIES.find(m => m.id === parseInt(movieId));
      if (movie) {
        setBooking(prev => ({ ...prev, movie }));
        setCurrentStep('formula');
      }
    }

    if (formulaId) {
      const formula = FORMULAS.find(f => f.id === formulaId);
      if (formula) {
        setBooking(prev => ({ ...prev, formula }));
        if (!movieId) setCurrentStep('movie');
      }
    }
  }, [searchParams]);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 'movie': return !!booking.movie;
      case 'formula': return !!booking.formula;
      case 'datetime': return !!booking.date && !!booking.time;
      case 'consumables': return true;
      case 'summary': return true;
    }
  };

  const goToNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goToPrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleConfirm = async () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);
    
    // Simuler l'appel API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Rediriger vers la page de succès
    router.push('/bookings?success=true');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span>Retour</span>
            </Link>
            <h1 className="text-xl font-bold">Réservation</h1>
            <div className="w-20" /> {/* Spacer */}
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                  disabled={index > currentStepIndex}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
                    ${currentStep === step.id
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : index < currentStepIndex
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-gray-500'
                    }
                    ${index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  {index < currentStepIndex ? (
                    <Check size={18} />
                  ) : (
                    step.icon
                  )}
                  <span className="hidden md:inline">{step.label}</span>
                </button>
                
                {index < STEPS.length - 1 && (
                  <div className={`
                    hidden sm:block w-8 md:w-16 h-0.5 mx-2
                    ${index < currentStepIndex ? 'bg-green-500' : 'bg-white/10'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentStep === 'movie' && (
          <MovieSelection
            selectedMovie={booking.movie}
            onSelect={(movie) => setBooking(prev => ({ ...prev, movie }))}
          />
        )}

        {currentStep === 'formula' && (
          <FormulaSelection
            selectedFormula={booking.formula}
            onSelect={(formula) => setBooking(prev => ({ ...prev, formula }))}
          />
        )}

        {currentStep === 'datetime' && (
          <DateTimeSelection
            selectedDate={booking.date}
            selectedTime={booking.time}
            onDateSelect={(date) => setBooking(prev => ({ ...prev, date }))}
            onTimeSelect={(time) => setBooking(prev => ({ ...prev, time }))}
          />
        )}

        {currentStep === 'consumables' && (
          <ConsumablesSelection
            selections={booking.consumables}
            onChange={(consumables) => setBooking(prev => ({ ...prev, consumables }))}
          />
        )}

        {currentStep === 'summary' && (
          <BookingSummary
            booking={booking}
            onConfirm={handleConfirm}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Navigation en bas */}
      {currentStep !== 'summary' && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/10 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Précédent
            </button>

            <button
              onClick={goToNext}
              disabled={!canGoNext()}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Suivant
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin text-4xl">🎬</div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
