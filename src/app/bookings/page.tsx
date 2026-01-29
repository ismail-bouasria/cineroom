"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, Button, Spinner, Alert, Badge, Input } from "@/components/ui";
import { useApiState, usePagination } from "@/lib/hooks";
import { bookingsApi, isLoading, hasError, hasData, isEmpty } from "@/lib/api-client";
import { Booking, ReservationStatus } from "@/types";
import { formatDate, formatCurrency, getStatusLabel, calculateDuration } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Film,
  Search,
  Filter,
  Ticket,
  Eye,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_VARIANTS: Record<ReservationStatus, "success" | "warning" | "error" | "default"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
  completed: "default",
};

const ITEMS_PER_PAGE = 10;

export default function BookingsPage() {
  const [bookingsState, setBookingsState] = useApiState<Booking[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");

  useEffect(() => {
    const fetchBookings = async () => {
      const result = await bookingsApi.getAll();
      setBookingsState(result);
    };
    fetchBookings();
  }, [setBookingsState]);

  const filteredBookings = hasData(bookingsState)
    ? bookingsState.data.filter((booking) => {
        const matchesSearch =
          booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const { currentPage, totalPages, paginatedItems, goToPage, nextPage, prevPage } =
    usePagination(filteredBookings, ITEMS_PER_PAGE);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    const result = await bookingsApi.update(bookingId, { status: "cancelled" });
    if (result.state === "success") {
      const refreshedBookings = await bookingsApi.getAll();
      setBookingsState(refreshedBookings);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Mes Réservations</h1>
            <p className="text-slate-400 mt-1">
              Gérez et suivez toutes vos réservations de salles
            </p>
          </div>
          <Link href="/rooms">
            <Button leftIcon={<Ticket className="w-5 h-5" />}>
              Nouvelle réservation
            </Button>
          </Link>
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
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | "all")}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="pending">En attente</option>
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

        {/* Empty State */}
        {isEmpty(bookingsState) && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-4">
              <Ticket className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune réservation
            </h3>
            <p className="text-slate-400 mb-4">
              Vous n&apos;avez pas encore effectué de réservation
            </p>
            <Link href="/rooms">
              <Button>Réserver une salle</Button>
            </Link>
          </div>
        )}

        {/* No Results */}
        {hasData(bookingsState) &&
          filteredBookings.length === 0 &&
          bookingsState.data.length > 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-4">
                <Search className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun résultat
              </h3>
              <p className="text-slate-400 mb-4">
                Aucune réservation ne correspond à vos critères
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}

        {/* Bookings List */}
        {paginatedItems.length > 0 && (
          <Card>
            <CardHeader title={`${filteredBookings.length} réservation(s)`} />
            <div className="divide-y divide-slate-800">
              {paginatedItems.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onCancel={() => handleCancelBooking(booking.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <CardContent className="border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Page {currentPage} sur {totalPages}
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
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-violet-600 text-white"
                                : "text-slate-400 hover:bg-slate-800"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
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
      </div>
    </DashboardLayout>
  );
}

interface BookingRowProps {
  booking: Booking;
  onCancel: () => void;
}

function BookingRow({ booking, onCancel }: BookingRowProps) {
  const isPast = new Date(booking.date) < new Date();
  const canModify = booking.status === "pending" || booking.status === "confirmed";

  return (
    <div className="p-4 hover:bg-slate-800/30 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Room Icon */}
        <div className="w-16 h-16 bg-linear-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center shrink-0">
          <Film className="w-8 h-8 text-white" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white">
              {booking.roomName || `Salle ${booking.roomId}`}
            </h4>
            <Badge variant={STATUS_VARIANTS[booking.status]}>
              {getStatusLabel(booking.status)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(booking.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {booking.startTime} - {booking.endTime}
              <span className="text-slate-600">
                ({calculateDuration(booking.startTime, booking.endTime)})
              </span>
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Réservation #{booking.id.slice(0, 8)}
          </p>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-white">
            {formatCurrency(booking.totalPrice)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/bookings/${booking.id}`}>
            <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
              Voir
            </Button>
          </Link>

          {canModify && !isPast && (
            <>
              <Link href={`/bookings/${booking.id}/edit`}>
                <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                  Modifier
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-900/20"
                leftIcon={<X className="w-4 h-4" />}
              >
                Annuler
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
