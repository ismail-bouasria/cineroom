'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Calendar, Film, Clock, ArrowRight, Ticket, Plus, Star, Users, Home, LogOut, User } from 'lucide-react';
import { Booking, FORMULAS } from '@/types';
import { useApiState } from '@/lib/hooks';
import { bookingsApi, isLoading, hasError, hasData } from '@/lib/api-client';
import { getImageUrl } from '@/lib/tmdb';

// ============================================
// COMPOSANTS
// ============================================

const StatCard = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color: string;
}) => (
  <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const BookingCard = ({ booking }: { booking: Booking }) => {
  const formula = FORMULAS.find(f => f.id === booking.formula);
  const isUpcoming = new Date(booking.date) >= new Date();
  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    modifiee: 'bg-yellow-500/20 text-yellow-400',
    annulee: 'bg-red-500/20 text-red-400',
    passee: 'bg-gray-500/20 text-gray-400'
  };
  const statusLabels = {
    active: 'Active',
    modifiee: 'Modifiée',
    annulee: 'Annulée',
    passee: 'Passée'
  };

  return (
    <Link href={`/bookings/${booking.id}`} className="block group">
      <div className="flex gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors">
        {/* Poster */}
        <div className="w-16 h-24 relative flex-shrink-0 rounded-lg overflow-hidden">
          {booking.moviePoster ? (
            <Image
              src={getImageUrl(booking.moviePoster, 'w200')}
              alt={booking.movieTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors truncate">
              {booking.movieTitle}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
              {statusLabels[booking.status]}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(booking.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {booking.time}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className={`text-sm font-medium bg-gradient-to-r ${formula?.color || 'from-gray-500 to-gray-600'} bg-clip-text text-transparent`}>
              {formula?.name || booking.formula}
            </span>
            <span className="text-sm font-bold text-white">{booking.totalPrice}€</span>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition-colors self-center" />
      </div>
    </Link>
  );
};

// ============================================
// PAGE DASHBOARD
// ============================================

export default function DashboardPage() {
  const { user } = useUser();
  const [bookingsState, setBookingsState] = useApiState<Booking[]>();

  useEffect(() => {
    const fetchBookings = async () => {
      const result = await bookingsApi.getAll();
      setBookingsState(result);
    };
    fetchBookings();
  }, [setBookingsState]);

  const allBookings = hasData(bookingsState) ? bookingsState.data : [];
  const activeBookings = allBookings.filter(b => b.status === 'active');
  const upcomingBookings = allBookings
    .filter(b => new Date(b.date) >= new Date() && b.status === 'active')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  const totalSpent = allBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-lg font-black">
              Cine<span className="text-red-500">Room</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
              Accueil
            </Link>
            <Link href="/catalogue" className="text-gray-400 hover:text-white transition-colors">
              Catalogue
            </Link>
            <Link href="/bookings" className="text-gray-400 hover:text-white transition-colors">
              Réservations
            </Link>
            <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <SignOutButton>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </SignOutButton>
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/" className="p-2 text-gray-400 hover:text-white">
              <Home className="w-5 h-5" />
            </Link>
            <SignOutButton>
              <button className="p-2 text-gray-400 hover:text-red-400">
                <LogOut className="w-5 h-5" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-b from-red-950/30 to-transparent py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black">
                Bonjour, {user?.firstName || 'Cinéphile'} 👋
              </h1>
              <p className="text-gray-400 mt-1">
                Bienvenue sur votre espace CineRoom
              </p>
            </div>
            <Link
              href="/book"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle réservation
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Ticket className="w-8 h-8 text-violet-400" />}
            label="Réservations actives"
            value={activeBookings.length}
            color="bg-violet-900/30"
          />
          <StatCard
            icon={<Film className="w-8 h-8 text-amber-400" />}
            label="Films visionnés"
            value={allBookings.filter(b => b.status === 'passee').length}
            color="bg-amber-900/30"
          />
          <StatCard
            icon={<Star className="w-8 h-8 text-emerald-400" />}
            label="Total dépensé"
            value={`${totalSpent}€`}
            color="bg-emerald-900/30"
          />
        </div>

        {/* Prochaines réservations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Prochaines réservations</h2>
            <Link
              href="/bookings"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading(bookingsState) && (
            <div className="flex justify-center py-12">
              <div className="animate-spin text-4xl">🎬</div>
            </div>
          )}

          {hasError(bookingsState) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <p className="text-red-400">{bookingsState.error}</p>
            </div>
          )}

          {hasData(bookingsState) && upcomingBookings.length === 0 && (
            <div className="bg-white/5 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucune réservation à venir</h3>
              <p className="text-gray-400 mb-6">
                Réservez votre prochaine séance cinéma privée
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
              >
                <Ticket className="w-5 h-5" />
                Réserver maintenant
              </Link>
            </div>
          )}

          {upcomingBookings.length > 0 && (
            <div className="space-y-3">
              {upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </section>

        {/* Nos formules */}
        <section>
          <h2 className="text-xl font-bold mb-4">Nos formules</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {FORMULAS.map(formula => (
              <Link
                key={formula.id}
                href={`/book?formula=${formula.id}`}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${formula.color} hover:scale-105 transition-transform`}
              >
                {formula.popular && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    ⭐ Populaire
                  </span>
                )}
                <div className="text-3xl mb-3">{formula.icon}</div>
                <h3 className="text-xl font-bold">{formula.name}</h3>
                <p className="text-white/70 text-sm mt-1">{formula.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="flex items-center gap-1 text-white/80 text-sm">
                    <Users className="w-4 h-4" />
                    {formula.seats} places
                  </span>
                  <span className="text-xl font-bold">{formula.basePrice}€</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Historique */}
        {allBookings.filter(b => b.status === 'passee').length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Historique récent</h2>
            <div className="space-y-3">
              {allBookings
                .filter(b => b.status === 'passee')
                .slice(0, 3)
                .map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
            </div>
          </section>
        )}
      </main>

      {/* Navigation mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/10 py-4 px-4 md:hidden">
        <div className="flex justify-around">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-red-400">
            <Film className="w-6 h-6" />
            <span className="text-xs">Accueil</span>
          </Link>
          <Link href="/book" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
            <Plus className="w-6 h-6" />
            <span className="text-xs">Réserver</span>
          </Link>
          <Link href="/bookings" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
            <Ticket className="w-6 h-6" />
            <span className="text-xs">Mes séances</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
            <User className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>

      {/* Espace pour la navbar mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
