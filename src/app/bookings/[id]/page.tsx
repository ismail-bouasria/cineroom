"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, Button, Spinner, Alert, Badge } from "@/components/ui";
import { useApiState } from "@/lib/hooks";
import { bookingsApi, isLoading, hasError, hasData } from "@/lib/api-client";
import { Booking, ReservationStatus } from "@/types";
import { formatDate, formatCurrency, getStatusLabel, calculateDuration } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Film,
  CreditCard,
  Edit,
  X,
  Printer,
  Share2,
  CheckCircle,
  MapPin,
  MessageSquare,
} from "lucide-react";

const STATUS_VARIANTS: Record<ReservationStatus, "success" | "warning" | "error" | "default"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
  completed: "default",
};

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [bookingState, setBookingState] = useApiState<Booking>();

  useEffect(() => {
    const fetchBooking = async () => {
      const result = await bookingsApi.getById(id);
      setBookingState(result);
    };
    fetchBooking();
  }, [id, setBookingState]);

  const handleCancelBooking = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    const result = await bookingsApi.update(id, { status: "cancelled" });
    if (result.state === "success") {
      const refreshedBooking = await bookingsApi.getById(id);
      setBookingState(refreshedBooking);
    }
  };

  if (isLoading(bookingState)) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (hasError(bookingState)) {
    return (
      <DashboardLayout>
        <Alert variant="error" title="Réservation introuvable">
          {bookingState.error}
        </Alert>
        <Link href="/bookings" className="mt-4 inline-block">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Retour aux réservations
          </Button>
        </Link>
      </DashboardLayout>
    );
  }

  if (!hasData(bookingState)) return null;

  const booking = bookingState.data;
  const isPast = new Date(booking.date) < new Date();
  const canModify =
    (booking.status === "pending" || booking.status === "confirmed") && !isPast;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Alert */}
        {isSuccess && (
          <Alert variant="success" title="Réservation confirmée !">
            Votre réservation a été enregistrée avec succès. Vous recevrez un email de confirmation.
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/bookings">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Réservation #{booking.id.slice(0, 8)}
              </h1>
              <p className="text-slate-400">
                Créée le {formatDate(booking.createdAt || new Date().toISOString())}
              </p>
            </div>
          </div>
          <Badge variant={STATUS_VARIANTS[booking.status]} className="text-base px-4 py-1">
            {getStatusLabel(booking.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Info */}
            <Card>
              <CardHeader
                title="Salle réservée"
                icon={<Film className="w-5 h-5 text-violet-400" />}
              />
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-linear-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
                    <Film className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {booking.roomName || `Salle ${booking.roomId}`}
                    </h3>
                    <p className="text-slate-400">Salle de cinéma privée</p>
                    <Link
                      href={`/rooms/${booking.roomId}/book`}
                      className="text-violet-400 hover:text-violet-300 text-sm mt-1 inline-block"
                    >
                      Voir les détails de la salle →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader
                title="Date et horaires"
                icon={<Calendar className="w-5 h-5 text-violet-400" />}
              />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <Calendar className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Date</p>
                      <p className="text-white font-medium">{formatDate(booking.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <Clock className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Horaires</p>
                      <p className="text-white font-medium">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <Users className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Invités</p>
                      <p className="text-white font-medium">
                        {booking.numberOfGuests} personne(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-violet-900/20 rounded-lg border border-violet-800">
                  <div className="flex items-center gap-2 text-violet-400">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">
                      Durée totale: {calculateDuration(booking.startTime, booking.endTime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            {booking.specialRequests && (
              <Card>
                <CardHeader
                  title="Demandes spéciales"
                  icon={<MessageSquare className="w-5 h-5 text-violet-400" />}
                />
                <CardContent>
                  <p className="text-slate-300">{booking.specialRequests}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader
                title="Récapitulatif"
                icon={<CreditCard className="w-5 h-5 text-violet-400" />}
              />
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Salle</span>
                    <span className="text-white">{booking.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Durée</span>
                    <span className="text-white">
                      {calculateDuration(booking.startTime, booking.endTime)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-2xl font-bold text-violet-400">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                  </div>
                </div>

                {booking.status === "confirmed" && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-900/20 rounded-lg border border-emerald-800">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Paiement confirmé</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader
                title="Adresse"
                icon={<MapPin className="w-5 h-5 text-violet-400" />}
              />
              <CardContent>
                <p className="text-slate-300">
                  CineRoom Paris
                  <br />
                  123 Avenue du Cinéma
                  <br />
                  75001 Paris, France
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="space-y-3">
                {canModify && (
                  <>
                    <Link href={`/bookings/${booking.id}/edit`} className="block">
                      <Button
                        variant="outline"
                        fullWidth
                        leftIcon={<Edit className="w-4 h-4" />}
                      >
                        Modifier la réservation
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={handleCancelBooking}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-900/20"
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Annuler la réservation
                    </Button>
                  </>
                )}

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" leftIcon={<Printer className="w-4 h-4" />}>
                    Imprimer
                  </Button>
                  <Button variant="ghost" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
