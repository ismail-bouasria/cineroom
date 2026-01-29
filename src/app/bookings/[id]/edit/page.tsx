"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, Button, Spinner, Alert, Input } from "@/components/ui";
import { useApiState, useForm } from "@/lib/hooks";
import {
  bookingsApi,
  isLoading,
  hasError,
  hasData,
  createLoadingState,
  createSuccessState,
  createErrorState,
} from "@/lib/api-client";
import { Booking, UpdateBookingInput, UpdateBookingInputSchema } from "@/types";
import { generateTimeSlots, calculateDuration } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, Users, Save } from "lucide-react";

interface EditBookingPageProps {
  params: Promise<{ id: string }>;
}

const TIME_SLOTS = generateTimeSlots(9, 23, 30);

export default function EditBookingPage({ params }: EditBookingPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [bookingState, setBookingState] = useApiState<Booking>();
  const [submitState, setSubmitState] = useApiState<void>();

  const { values, errors, setFieldValue, validate, setValues } = useForm<UpdateBookingInput>(
    {
      date: "",
      startTime: "",
      endTime: "",
      numberOfGuests: 1,
      specialRequests: "",
    },
    UpdateBookingInputSchema
  );

  useEffect(() => {
    const fetchBooking = async () => {
      const result = await bookingsApi.getById(id);
      setBookingState(result);

      if (result.state === "success" && result.data) {
        setValues({
          date: result.data.date,
          startTime: result.data.startTime,
          endTime: result.data.endTime,
          numberOfGuests: result.data.numberOfGuests,
          specialRequests: result.data.specialRequests || "",
        });
      }
    };
    fetchBooking();
  }, [id, setBookingState, setValues]);

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitState(createLoadingState());

    try {
      const result = await bookingsApi.update(id, values);

      if (result.state === "success") {
        setSubmitState(createSuccessState(undefined));
        router.push(`/bookings/${id}?updated=true`);
      } else {
        setSubmitState(createErrorState(result.error || "Erreur lors de la modification"));
      }
    } catch {
      setSubmitState(createErrorState("Une erreur est survenue"));
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/bookings/${id}`}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Modifier la réservation</h1>
            <p className="text-slate-400">
              {booking.roomName || `Salle ${booking.roomId}`} - #{id.slice(0, 8)}
            </p>
          </div>
        </div>

        {hasError(submitState) && (
          <Alert variant="error" title="Erreur">
            {submitState.error}
          </Alert>
        )}

        <Card>
          <CardHeader title="Informations de réservation" />
          <CardContent className="space-y-6">
            {/* Date */}
            <Input
              type="date"
              label="Date de la séance"
              value={values.date}
              onChange={(e) => setFieldValue("date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              error={errors.date}
              leftIcon={<Calendar className="w-5 h-5" />}
            />

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Heure de début
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                  value={values.startTime}
                  onChange={(e) => setFieldValue("startTime", e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.startTime && (
                  <p className="text-rose-500 text-sm mt-1">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Heure de fin
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                  value={values.endTime}
                  onChange={(e) => setFieldValue("endTime", e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  {TIME_SLOTS.filter((slot) => slot > (values.startTime || "")).map(
                    (slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    )
                  )}
                </select>
                {errors.endTime && (
                  <p className="text-rose-500 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>

            {values.startTime && values.endTime && (
              <div className="p-4 bg-violet-900/20 rounded-lg border border-violet-800">
                <div className="flex items-center gap-2 text-violet-400">
                  <Clock className="w-5 h-5" />
                  <span>
                    Durée: {calculateDuration(values.startTime, values.endTime)}
                  </span>
                </div>
              </div>
            )}

            {/* Guests */}
            <Input
              type="number"
              label="Nombre d'invités"
              value={values.numberOfGuests}
              onChange={(e) => setFieldValue("numberOfGuests", Number(e.target.value))}
              min={1}
              error={errors.numberOfGuests}
              leftIcon={<Users className="w-5 h-5" />}
            />

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Demandes spéciales (optionnel)
              </label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Anniversaire, configuration spéciale..."
                value={values.specialRequests || ""}
                onChange={(e) => setFieldValue("specialRequests", e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-800">
              <Link href={`/bookings/${id}`}>
                <Button variant="outline">Annuler</Button>
              </Link>
              <Button
                onClick={handleSubmit}
                isLoading={isLoading(submitState)}
                leftIcon={<Save className="w-5 h-5" />}
              >
                Enregistrer les modifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
