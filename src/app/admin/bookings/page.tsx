"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  Button,
  Spinner,
  Alert,
  Badge,
  Input,
} from "@/components/ui";
import { useApiState, usePagination } from "@/lib/hooks";
import { bookingsApi, isLoading, hasError, hasData } from "@/lib/api-client";
import { Booking, ReservationStatus } from "@/types";
import { formatDate, formatCurrency, getStatusLabel, calculateDuration } from "@/lib/utils";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Film,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

const STATUS_VARIANTS: Record<ReservationStatus, "success" | "warning" | "error" | "default"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
  completed: "default",
};

const ITEMS_PER_PAGE = 15;

export default function AdminBookingsPage() {
  const [bookingsState, setBookingsState] = useApiState<Booking[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const result = await bookingsApi.getAll();
      setBookingsState(result);
    };
    fetchData();
  }, [setBookingsState]);

  const fetchBookings = async () => {
    const result = await bookingsApi.getAll();
    setBookingsState(result);
  };

  const filteredBookings = hasData(bookingsState)
    ? bookingsState.data.filter((booking) => {
        const matchesSearch =
          booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        const matchesDate = !dateFilter || booking.date === dateFilter;
        return matchesSearch && matchesStatus && matchesDate;
      })
    : [];

  const { currentPage, totalPages, paginatedItems, nextPage, prevPage } =
    usePagination(filteredBookings, ITEMS_PER_PAGE);

  const handleConfirmBooking = async (bookingId: string) => {
    await bookingsApi.update(bookingId, { status: "confirmed" });
    fetchBookings();
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
    await bookingsApi.update(bookingId, { status: "cancelled" });
    fetchBookings();
  };

  const stats = {
    total: hasData(bookingsState) ? bookingsState.data.length : 0,
    pending: hasData(bookingsState)
      ? bookingsState.data.filter((b) => b.status === "pending").length
      : 0,
    confirmed: hasData(bookingsState)
      ? bookingsState.data.filter((b) => b.status === "confirmed").length
      : 0,
    cancelled: hasData(bookingsState)
      ? bookingsState.data.filter((b) => b.status === "cancelled").length
      : 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des réservations</h1>
            <p className="text-slate-400 mt-1">
              Validez et gérez toutes les réservations
            </p>
          </div>
          <Button variant="outline" leftIcon={<Download className="w-5 h-5" />}>
            Exporter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
              <p className="text-slate-400 text-sm">En attente</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{stats.confirmed}</p>
              <p className="text-slate-400 text-sm">Confirmées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-rose-400">{stats.cancelled}</p>
              <p className="text-slate-400 text-sm">Annulées</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par salle ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  leftIcon={<Calendar className="w-5 h-5" />}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as ReservationStatus | "all")
                  }
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="cancelled">Annulées</option>
                  <option value="completed">Terminées</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading(bookingsState) && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {hasError(bookingsState) && (
          <Alert variant="error" title="Erreur de chargement">
            {bookingsState.error}
          </Alert>
        )}

        {/* Bookings Table */}
        {hasData(bookingsState) && paginatedItems.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 font-medium">
                      Réservation
                    </th>
                    <th className="text-left p-4 text-slate-400 font-medium">Salle</th>
                    <th className="text-left p-4 text-slate-400 font-medium">
                      Date & Horaires
                    </th>
                    <th className="text-left p-4 text-slate-400 font-medium">Montant</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Statut</th>
                    <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedItems.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-800/30">
                      <td className="p-4">
                        <p className="font-medium text-white">
                          #{booking.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-slate-400">
                          {booking.numberOfGuests} invité(s)
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-linear-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                            <Film className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white">
                            {booking.roomName || `Salle ${booking.roomId}`}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-white">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {formatDate(booking.date)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {booking.startTime} - {booking.endTime} (
                          {calculateDuration(booking.startTime, booking.endTime)})
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">
                          {formatCurrency(booking.totalPrice)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={STATUS_VARIANTS[booking.status]}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/bookings/${booking.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>

                          {booking.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfirmBooking(booking.id)}
                                className="text-emerald-400 hover:text-emerald-300"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <CardContent className="border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Page {currentPage} sur {totalPages} ({filteredBookings.length}{" "}
                    résultat(s))
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* No results */}
        {hasData(bookingsState) && paginatedItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">Aucune réservation trouvée</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
