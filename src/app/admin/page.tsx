'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Ticket, Film, Users, TrendingUp, 
  Calendar, ArrowUp, ArrowDown, Eye, Check, X, Clock, ShieldX 
} from 'lucide-react';
import { Booking, FORMULAS, ReservationStatus } from '@/types';
import { useApiState } from '@/lib/hooks';
import { statsApi, adminApi, DashboardStats, isLoading, hasData, hasError } from '@/lib/api-client';
import { getImageUrl } from '@/lib/tmdb';

// ============================================
// COMPOSANTS
// ============================================

const StatCard = ({
  title,
  value,
  change,
  icon,
  color
}: {
  title: string;
  value: string | number;
  change?: { value: number; label: string };
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-sm ${change.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change.value >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {Math.abs(change.value)}%
        </div>
      )}
    </div>
    <p className="text-3xl font-bold text-white mt-4">{value}</p>
    <p className="text-gray-400 text-sm mt-1">{title}</p>
  </div>
);

const statusColors: Record<ReservationStatus, string> = {
  active: 'bg-green-500/20 text-green-400',
  modifiee: 'bg-yellow-500/20 text-yellow-400',
  annulee: 'bg-red-500/20 text-red-400',
  passee: 'bg-gray-500/20 text-gray-400'
};

const BookingRow = ({
  booking,
  onConfirm,
  onCancel
}: {
  booking: Booking;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) => {
  const formula = FORMULAS.find(f => f.id === booking.formula);
  
  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 relative rounded overflow-hidden flex-shrink-0">
            <Image
              src={getImageUrl(booking.moviePoster ?? null, 'w200')}
              alt={booking.movieTitle ?? 'Film'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-white">{booking.movieTitle ?? 'Film'}</p>
            <p className="text-sm text-gray-500">#{booking.id}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${formula?.color}`}>
          {formula?.name}
        </span>
      </td>
      <td className="py-4 px-4 text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date(booking.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm">
          <Clock className="w-3 h-3" />
          {booking.time}
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
          {booking.status}
        </span>
      </td>
      <td className="py-4 px-4 text-white font-medium">{booking.totalPrice}€</td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/bookings/${booking.id}`}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {booking.status === 'active' && (
            <>
              <button
                onClick={() => onConfirm(booking.id)}
                className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                title="Confirmer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onCancel(booking.id)}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                title="Annuler"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// ============================================
// PAGE ADMIN
// ============================================

export default function AdminDashboardPage() {
  const router = useRouter();
  const [statsState, setStatsState] = useApiState<DashboardStats>();
  const [bookingsState, setBookingsState] = useApiState<Booking[]>();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tenter de récupérer les stats admin - si ça échoue, l'utilisateur n'est pas admin
        const [stats, bookings] = await Promise.all([
          statsApi.getDashboard(),
          adminApi.getAllBookings()
        ]);
        
        // Si on arrive ici sans erreur, l'utilisateur est admin
        if (hasError(stats) || hasError(bookings)) {
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(true);
        setStatsState(stats);
        setBookingsState(bookings);
      } catch {
        setIsAdmin(false);
      }
    };
    fetchData();
  }, [setStatsState, setBookingsState]);

  // Afficher un écran de chargement pendant la vérification
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin text-4xl">🎬</div>
      </div>
    );
  }

  // Afficher la page d'erreur si l'utilisateur n'est pas admin
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Accès refusé</h1>
          <p className="text-gray-400 mb-8">
            Vous n&apos;avez pas les droits administrateur pour accéder à cette page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium text-white transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              Mon Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirm = async (id: string) => {
    await adminApi.updateBookingStatus(id, 'active');
    const result = await adminApi.getAllBookings();
    setBookingsState(result);
  };

  const handleCancel = async (id: string) => {
    if (confirm('Annuler cette réservation ?')) {
      await adminApi.updateBookingStatus(id, 'annulee');
      const result = await adminApi.getAllBookings();
      setBookingsState(result);
    }
  };

  const stats = hasData(statsState) ? statsState.data : null;
  const bookings = hasData(bookingsState) ? bookingsState.data : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/5 border-r border-white/10 p-6 hidden lg:block">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <span className="text-xl font-black">
            Cine<span className="text-red-500">Room</span>
          </span>
        </Link>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'overview' ? 'bg-red-600' : 'hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Vue d&apos;ensemble
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'bookings' ? 'bg-red-600' : 'hover:bg-white/10'
            }`}
          >
            <Ticket className="w-5 h-5" />
            Réservations
          </button>
          <Link
            href="/admin/resources"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Users className="w-5 h-5" />
            Ressources
          </Link>
          <Link
            href="/catalogue"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Film className="w-5 h-5" />
            Catalogue
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link
            href="/dashboard"
            className="block text-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Retour utilisateur
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black">Administration</h1>
          <p className="text-gray-400 mt-1">Tableau de bord CineRoom</p>
        </div>

        {isLoading(statsState) && (
          <div className="flex justify-center py-20">
            <div className="animate-spin text-4xl">🎬</div>
          </div>
        )}

        {hasData(statsState) && activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Réservations totales"
                value={stats?.totalBookings || 0}
                change={{ value: 12, label: 'vs mois dernier' }}
                icon={<Ticket className="w-6 h-6 text-violet-400" />}
                color="bg-violet-900/30"
              />
              <StatCard
                title="Réservations actives"
                value={stats?.activeBookings || 0}
                icon={<Calendar className="w-6 h-6 text-green-400" />}
                color="bg-green-900/30"
              />
              <StatCard
                title="Revenus"
                value={`${stats?.totalRevenue || 0}€`}
                change={{ value: 8, label: 'vs mois dernier' }}
                icon={<TrendingUp className="w-6 h-6 text-amber-400" />}
                color="bg-amber-900/30"
              />
              <StatCard
                title="Annulations"
                value={stats?.cancelledBookings || 0}
                icon={<X className="w-6 h-6 text-red-400" />}
                color="bg-red-900/30"
              />
            </div>

            {/* Formules populaires */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Formules populaires</h2>
                <div className="space-y-4">
                  {stats?.popularFormulas.map((item, index) => (
                    <div key={item.formula} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium">{item.formula}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                            style={{ width: `${(item.count / 50) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Dernières réservations</h2>
                <div className="space-y-3">
                  {bookings.slice(0, 5).map(booking => {
                    const formula = FORMULAS.find(f => f.id === booking.formula);
                    return (
                      <div key={booking.id} className="flex items-center gap-3">
                        <div className="w-10 h-14 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={getImageUrl(booking.moviePoster ?? null, 'w200')}
                            alt={booking.movieTitle ?? 'Film'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{booking.movieTitle ?? 'Film'}</p>
                          <p className="text-sm text-gray-400">{formula?.name}</p>
                        </div>
                        <span className="font-bold">{booking.totalPrice}€</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Toutes les réservations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                    <th className="py-4 px-4 font-medium">Film</th>
                    <th className="py-4 px-4 font-medium">Formule</th>
                    <th className="py-4 px-4 font-medium">Date</th>
                    <th className="py-4 px-4 font-medium">Statut</th>
                    <th className="py-4 px-4 font-medium">Prix</th>
                    <th className="py-4 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
