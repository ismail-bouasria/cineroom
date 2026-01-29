"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Button, Spinner, Alert, Badge, Input } from "@/components/ui";
import { useApiState } from "@/lib/hooks";
import { roomsApi, isLoading, hasError, hasData, isEmpty } from "@/lib/api-client";
import { Room } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Film,
  Users,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Calendar,
  Star,
  Tv,
  Wifi,
  Speaker,
} from "lucide-react";

type ViewMode = "grid" | "list";

const EQUIPMENT_ICONS: Record<string, React.ReactNode> = {
  "4K": <Tv className="w-4 h-4" />,
  Dolby: <Speaker className="w-4 h-4" />,
  WiFi: <Wifi className="w-4 h-4" />,
};

export default function RoomsPage() {
  const [roomsState, setRoomsState] = useApiState<Room[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      const result = await roomsApi.getAll();
      setRoomsState(result);
    };
    fetchRooms();
  }, [setRoomsState]);

  const filteredRooms = hasData(roomsState)
    ? roomsState.data.filter((room) => {
        const matchesSearch =
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCapacity = !capacityFilter || room.capacity >= capacityFilter;
        return matchesSearch && matchesCapacity && room.isAvailable;
      })
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Nos Salles</h1>
          <p className="text-slate-400 mt-1">
            Découvrez nos salles de cinéma privées et réservez votre séance
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher une salle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
                  value={capacityFilter || ""}
                  onChange={(e) =>
                    setCapacityFilter(e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <option value="">Toutes capacités</option>
                  <option value="2">2+ personnes</option>
                  <option value="5">5+ personnes</option>
                  <option value="10">10+ personnes</option>
                  <option value="20">20+ personnes</option>
                </select>

                <div className="flex bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading(roomsState) && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {hasError(roomsState) && (
          <Alert variant="error" title="Erreur de chargement">
            {roomsState.error}
          </Alert>
        )}

        {/* Empty State */}
        {isEmpty(roomsState) && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-4">
              <Film className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune salle disponible
            </h3>
            <p className="text-slate-400">
              Revenez plus tard pour découvrir nos salles
            </p>
          </div>
        )}

        {/* No Results */}
        {hasData(roomsState) && filteredRooms.length === 0 && roomsState.data.length > 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-4">
              <SlidersHorizontal className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun résultat
            </h3>
            <p className="text-slate-400 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCapacityFilter(null);
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filteredRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && filteredRooms.length > 0 && (
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <RoomListItem key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <Card hoverable className="overflow-hidden group">
      <div className="relative h-48 bg-slate-800">
        {room.imageUrl ? (
          <Image
            src={room.imageUrl}
            alt={room.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
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
          <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
            {room.name}
          </h3>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">
            {room.description || "Une salle de cinéma privée moderne et confortable"}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {room.capacity} places
          </span>
          {room.equipment?.slice(0, 2).map((eq) => (
            <span key={eq} className="flex items-center gap-1">
              {EQUIPMENT_ICONS[eq] || <Tv className="w-4 h-4" />}
              {eq}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(room.pricePerHour)}
            </span>
            <span className="text-slate-400 text-sm">/heure</span>
          </div>
          <Link href={`/rooms/${room.id}/book`}>
            <Button leftIcon={<Calendar className="w-4 h-4" />}>Réserver</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomListItem({ room }: { room: Room }) {
  return (
    <Card hoverable>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-48 h-32 bg-slate-800 rounded-lg overflow-hidden shrink-0">
            {room.imageUrl ? (
              <Image
                src={room.imageUrl}
                alt={room.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-violet-900 to-purple-900">
                <Film className="w-12 h-12 text-white/30" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                <Badge variant="primary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {room.rating || "4.5"}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {room.description || "Une salle de cinéma privée moderne et confortable"}
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {room.capacity} places
                </span>
                {room.equipment?.map((eq) => (
                  <span key={eq} className="flex items-center gap-1">
                    {EQUIPMENT_ICONS[eq] || <Tv className="w-4 h-4" />}
                    {eq}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(room.pricePerHour)}
                  </span>
                  <span className="text-slate-400 text-sm">/heure</span>
                </div>
                <Link href={`/rooms/${room.id}/book`}>
                  <Button leftIcon={<Calendar className="w-4 h-4" />}>Réserver</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
