"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, Button, Spinner, Alert, Badge } from "@/components/ui";
import { useApiState } from "@/lib/hooks";
import { bookingsApi, roomsApi, isLoading, hasError, hasData } from "@/lib/api-client";
import { Booking, Room } from "@/types";
import { Calendar, Film, Clock, ArrowRight, Ticket, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useUser();
  const [bookingsState, setBookingsState] = useApiState<Booking[]>();
  const [roomsState, setRoomsState] = useApiState<Room[]>();

  useEffect(() => {
    const fetchData = async () => {
      const [bookingsResult, roomsResult] = await Promise.all([
        bookingsApi.getAll(),
        roomsApi.getAll(),
      ]);
      setBookingsState(bookingsResult);
      setRoomsState(roomsResult);
    };
    fetchData();
  }, [setBookingsState, setRoomsState]);

  const upcomingBookings = hasData(bookingsState)
    ? bookingsState.data
        .filter((b) => new Date(b.date) >= new Date() && b.status === "confirmed")
        .slice(0, 3)
    : [];

  const stats = {
    totalBookings: hasData(bookingsState) ? bookingsState.data.length : 0,
    confirmedBookings: hasData(bookingsState)
      ? bookingsState.data.filter((b) => b.status === "confirmed").length
      : 0,
    availableRooms: hasData(roomsState)
      ? roomsState.data.filter((r) => r.isAvailable).length
      : 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Bonjour, {user?.firstName || "Cinéphile"} 👋
            </h1>
            <p className="text-slate-400 mt-1">
              Bienvenue sur votre espace de réservation CineRoom
            </p>
          </div>
          <Link href="/rooms">
            <Button leftIcon={<Plus className="w-5 h-5" />}>
              Nouvelle réservation
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-4 bg-violet-900/30 rounded-xl">
                <Ticket className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Réservations totales</p>
                <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-4 bg-emerald-900/30 rounded-xl">
                <Calendar className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Confirmées</p>
                <p className="text-3xl font-bold text-white">{stats.confirmedBookings}</p>
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-4 bg-amber-900/30 rounded-xl">
                <Film className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Salles disponibles</p>
                <p className="text-3xl font-bold text-white">{stats.availableRooms}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader
            title="Prochaines réservations"
            action={
              <Link href="/bookings">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Voir tout
                </Button>
              </Link>
            }
          />
          <CardContent>
            {isLoading(bookingsState) && (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            )}

            {hasError(bookingsState) && (
              <Alert variant="error" title="Erreur de chargement">
                {bookingsState.error}
              </Alert>
            )}

            {hasData(bookingsState) && upcomingBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Aucune réservation à venir
                </h3>
                <p className="text-slate-400 mb-4">
                  Réservez une salle pour votre prochaine séance ciné
                </p>
                <Link href="/rooms">
                  <Button>Explorer les salles</Button>
                </Link>
              </div>
            )}

            {upcomingBookings.length > 0 && (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="block group"
                  >
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                      <div className="w-16 h-16 bg-linear-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                        <Film className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                          {booking.roomName || `Salle ${booking.roomId}`}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </div>
                      <Badge variant="success">Confirmée</Badge>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
