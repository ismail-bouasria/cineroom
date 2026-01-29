"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, Button, Spinner, Alert, Badge } from "@/components/ui";
import { useApiState } from "@/lib/hooks";
import { bookingsApi, roomsApi, isLoading, hasError, hasData } from "@/lib/api-client";
import { Booking, Room } from "@/types";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/utils";
import {
  Users,
  Film,
  Calendar,
  TrendingUp,
  ArrowRight,
  DollarSign,
  Activity,
  Clock,
  Settings,
  FileText,
} from "lucide-react";

export default function AdminDashboardPage() {
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

  const stats = {
    totalBookings: hasData(bookingsState) ? bookingsState.data.length : 0,
    totalRooms: hasData(roomsState) ? roomsState.data.length : 0,
    pendingBookings: hasData(bookingsState)
      ? bookingsState.data.filter((b) => b.status === "pending").length
      : 0,
    revenue: hasData(bookingsState)
      ? bookingsState.data
          .filter((b) => b.status === "confirmed" || b.status === "completed")
          .reduce((sum, b) => sum + b.totalPrice, 0)
      : 0,
  };

  const recentBookings = hasData(bookingsState)
    ? [...bookingsState.data]
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.date).getTime() -
            new Date(a.createdAt || a.date).getTime()
        )
        .slice(0, 5)
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Administration</h1>
            <p className="text-slate-400 mt-1">
              Vue d&apos;ensemble de votre activité CineRoom
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/rooms">
              <Button variant="outline" leftIcon={<Film className="w-5 h-5" />}>
                Gérer les salles
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button leftIcon={<Calendar className="w-5 h-5" />}>
                Voir les réservations
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverable>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Revenu total</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {formatCurrency(stats.revenue)}
                  </p>
                  <p className="text-emerald-400 text-sm flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4" />
                    +12% ce mois
                  </p>
                </div>
                <div className="p-4 bg-emerald-900/30 rounded-xl">
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total réservations</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.totalBookings}
                  </p>
                  <p className="text-violet-400 text-sm flex items-center gap-1 mt-2">
                    <Activity className="w-4 h-4" />
                    Actif
                  </p>
                </div>
                <div className="p-4 bg-violet-900/30 rounded-xl">
                  <Calendar className="w-8 h-8 text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">En attente</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {stats.pendingBookings}
                  </p>
                  <p className="text-amber-400 text-sm flex items-center gap-1 mt-2">
                    <Clock className="w-4 h-4" />À traiter
                  </p>
                </div>
                <div className="p-4 bg-amber-900/30 rounded-xl">
                  <Clock className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Salles actives</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.totalRooms}</p>
                  <p className="text-sky-400 text-sm flex items-center gap-1 mt-2">
                    <Film className="w-4 h-4" />
                    Disponibles
                  </p>
                </div>
                <div className="p-4 bg-sky-900/30 rounded-xl">
                  <Film className="w-8 h-8 text-sky-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Réservations récentes"
                action={
                  <Link href="/admin/bookings">
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
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
                  <Alert variant="error" title="Erreur">
                    {bookingsState.error}
                  </Alert>
                )}

                {recentBookings.length > 0 && (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/bookings/${booking.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                              <Film className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {booking.roomName || `Salle ${booking.roomId}`}
                              </p>
                              <p className="text-sm text-slate-400">
                                {formatDate(booking.date)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {formatCurrency(booking.totalPrice)}
                            </p>
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "success"
                                  : booking.status === "pending"
                                  ? "warning"
                                  : "default"
                              }
                              className="text-xs"
                            >
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Actions rapides" />
            <CardContent className="space-y-3">
              <Link href="/admin/rooms" className="block">
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="p-2 bg-violet-900/30 rounded-lg">
                    <Film className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Gérer les salles</p>
                    <p className="text-sm text-slate-400">Ajouter ou modifier</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/bookings" className="block">
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="p-2 bg-emerald-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Réservations</p>
                    <p className="text-sm text-slate-400">Gérer les demandes</p>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="p-2 bg-amber-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Utilisateurs</p>
                  <p className="text-sm text-slate-400">Gérer les comptes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="p-2 bg-sky-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Rapports</p>
                  <p className="text-sm text-slate-400">Statistiques détaillées</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <Settings className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Paramètres</p>
                  <p className="text-sm text-slate-400">Configuration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
