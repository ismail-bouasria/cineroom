"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Spinner,
  Alert,
  Input,
  Badge,
} from "@/components/ui";
import { useApiState, useForm } from "@/lib/hooks";
import {
  roomsApi,
  bookingsApi,
  isLoading,
  hasError,
  hasData,
  createLoadingState,
  createSuccessState,
  createErrorState,
} from "@/lib/api-client";
import { Room, CreateBookingInput, CreateBookingInputSchema } from "@/types";
import { formatCurrency, formatDate, generateTimeSlots, calculateDuration } from "@/lib/utils";
import {
  Film,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  Check,
  CreditCard,
  Star,
  Tv,
  Wifi,
  Speaker,
  Info,
} from "lucide-react";

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

const EQUIPMENT_ICONS: Record<string, React.ReactNode> = {
  "4K": <Tv className="w-4 h-4" />,
  Dolby: <Speaker className="w-4 h-4" />,
  WiFi: <Wifi className="w-4 h-4" />,
};

const TIME_SLOTS = generateTimeSlots(9, 23, 30);

export default function BookRoomPage({ params }: BookingPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const [roomState, setRoomState] = useApiState<Room>();
  const [submitState, setSubmitState] = useApiState<void>();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { values, errors, setFieldValue, validate } = useForm<CreateBookingInput>(
    {
      roomId: id,
      date: "",
      startTime: "",
      endTime: "",
      numberOfGuests: 1,
      specialRequests: "",
    },
    CreateBookingInputSchema
  );

  useEffect(() => {
    const fetchRoom = async () => {
      const result = await roomsApi.getById(id);
      setRoomState(result);
    };
    fetchRoom();
  }, [id, setRoomState]);

  const calculateTotal = () => {
    if (!values.startTime || !values.endTime || !hasData(roomState)) return 0;

    const [startH, startM] = values.startTime.split(":").map(Number);
    const [endH, endM] = values.endTime.split(":").map(Number);
    const hours = endH - startH + (endM - startM) / 60;

    return hours * roomState.data.pricePerHour;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!values.date || !values.startTime || !values.endTime) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!values.numberOfGuests) {
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitState(createLoadingState());

    try {
      const result = await bookingsApi.create(values);

      if (result.state === "success" && result.data) {
        setSubmitState(createSuccessState(undefined));
        router.push(`/bookings/${result.data.id}?success=true`);
      } else {
        setSubmitState(createErrorState(result.error || "Erreur lors de la réservation"));
      }
    } catch {
      setSubmitState(createErrorState("Une erreur est survenue"));
    }
  };

  if (isLoading(roomState)) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (hasError(roomState)) {
    return (
      <DashboardLayout>
        <Alert variant="error" title="Salle introuvable">
          {roomState.error}
        </Alert>
        <Link href="/rooms" className="mt-4 inline-block">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Retour aux salles
          </Button>
        </Link>
      </DashboardLayout>
    );
  }

  if (!hasData(roomState)) return null;

  const room = roomState.data;
  const totalPrice = calculateTotal();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/rooms">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Réserver {room.name}</h1>
            <p className="text-slate-400">Complétez les informations pour réserver</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span
                    className={`text-sm hidden sm:inline ${
                      step >= s ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {s === 1 ? "Date & Horaires" : s === 2 ? "Détails" : "Confirmation"}
                  </span>
                  {s < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        step > s ? "bg-violet-600" : "bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Date & Time */}
            {step === 1 && (
              <Card>
                <CardHeader title="Choisissez votre créneau" />
                <CardContent className="space-y-6">
                  <Input
                    type="date"
                    label="Date de la séance"
                    value={values.date}
                    onChange={(e) => setFieldValue("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    error={errors.date}
                    leftIcon={<Calendar className="w-5 h-5" />}
                  />

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
                        {TIME_SLOTS.filter((slot) => slot > values.startTime).map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
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

                  <div className="flex justify-end">
                    <Button
                      onClick={handleNextStep}
                      disabled={!values.date || !values.startTime || !values.endTime}
                    >
                      Continuer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <Card>
                <CardHeader title="Détails de la réservation" />
                <CardContent className="space-y-6">
                  <Input
                    type="number"
                    label="Nombre d'invités"
                    value={values.numberOfGuests}
                    onChange={(e) => setFieldValue("numberOfGuests", Number(e.target.value))}
                    min={1}
                    max={room.capacity}
                    error={errors.numberOfGuests}
                    helperText={`Maximum: ${room.capacity} personnes`}
                    leftIcon={<Users className="w-5 h-5" />}
                  />

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

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Retour
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!values.numberOfGuests}
                    >
                      Continuer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <Card>
                <CardHeader title="Confirmer votre réservation" />
                <CardContent className="space-y-6">
                  {hasError(submitState) && (
                    <Alert variant="error" title="Erreur">
                      {submitState.error}
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <h4 className="font-medium text-white mb-3">Récapitulatif</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Salle</span>
                          <span className="text-white">{room.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Date</span>
                          <span className="text-white">{formatDate(values.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Horaire</span>
                          <span className="text-white">
                            {values.startTime} - {values.endTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Durée</span>
                          <span className="text-white">
                            {calculateDuration(values.startTime, values.endTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Invités</span>
                          <span className="text-white">{values.numberOfGuests} personnes</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-violet-900/20 rounded-lg border border-violet-800">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Total à payer</span>
                        <span className="text-2xl font-bold text-violet-400">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-4 bg-slate-800/50 rounded-lg">
                      <Info className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-400">
                        En confirmant cette réservation, vous acceptez nos conditions générales.
                        Un email de confirmation vous sera envoyé à {user?.emailAddresses[0]?.emailAddress}.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Retour
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      isLoading={isLoading(submitState)}
                      leftIcon={<CreditCard className="w-5 h-5" />}
                    >
                      Confirmer la réservation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Room Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <div className="relative h-48 bg-slate-800">
                {room.imageUrl ? (
                  <Image
                    src={room.imageUrl}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-violet-900 to-purple-900">
                    <Film className="w-16 h-16 text-white/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant="primary" className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {room.rating || "4.5"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {room.description || "Une salle de cinéma privée"}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {room.capacity} places
                  </span>
                </div>

                {room.equipment && room.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {room.equipment.map((eq) => (
                      <Badge key={eq} variant="default" className="flex items-center gap-1">
                        {EQUIPMENT_ICONS[eq] || <Tv className="w-3 h-3" />}
                        {eq}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {formatCurrency(room.pricePerHour)}
                    </span>
                    <span className="text-slate-400 text-sm">/heure</span>
                  </div>
                </div>

                {totalPrice > 0 && (
                  <div className="p-4 bg-violet-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Total estimé</span>
                      <span className="text-xl font-bold text-violet-400">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
