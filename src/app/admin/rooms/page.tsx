"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Spinner,
  Alert,
  Badge,
  Input,
} from "@/components/ui";
import { useApiState } from "@/lib/hooks";
import { roomsApi, isLoading, hasError, hasData } from "@/lib/api-client";
import { Room } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Film,
  Users,
  ToggleLeft,
  ToggleRight,
  Star,
} from "lucide-react";

export default function AdminRoomsPage() {
  const [roomsState, setRoomsState] = useApiState<Room[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const result = await roomsApi.getAll();
      setRoomsState(result);
    };
    fetchData();
  }, [setRoomsState]);

  const fetchRooms = async () => {
    const result = await roomsApi.getAll();
    setRoomsState(result);
  };

  const filteredRooms = hasData(roomsState)
    ? roomsState.data.filter(
        (room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleToggleAvailability = async (room: Room) => {
    await roomsApi.update(room.id, { isAvailable: !room.isAvailable });
    fetchRooms();
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette salle ?")) return;
    await roomsApi.delete(roomId);
    fetchRooms();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des salles</h1>
            <p className="text-slate-400 mt-1">
              Créez et gérez les salles de cinéma
            </p>
          </div>
          <Button
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setIsCreating(true)}
          >
            Ajouter une salle
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <Input
              placeholder="Rechercher une salle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
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

        {/* Rooms Table */}
        {hasData(roomsState) && (
          <Card>
            <CardHeader
              title={`${filteredRooms.length} salle(s)`}
            />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 font-medium">Salle</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Capacité</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Prix/heure</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Note</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Statut</th>
                    <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-linear-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                            <Film className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{room.name}</p>
                            <p className="text-sm text-slate-400 line-clamp-1">
                              {room.description || "Pas de description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Users className="w-4 h-4" />
                          {room.capacity}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">
                          {formatCurrency(room.pricePerHour)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                          {room.rating || "N/A"}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={room.isAvailable ? "success" : "error"}>
                          {room.isAvailable ? "Disponible" : "Indisponible"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAvailability(room)}
                            title={room.isAvailable ? "Désactiver" : "Activer"}
                          >
                            {room.isAvailable ? (
                              <ToggleRight className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create Room Modal Placeholder */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader title="Nouvelle salle" />
              <CardContent className="space-y-4">
                <Input label="Nom de la salle" placeholder="Salle Premium" />
                <Input
                  label="Description"
                  placeholder="Une salle de cinéma privée..."
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" label="Capacité" placeholder="10" />
                  <Input type="number" label="Prix/heure (€)" placeholder="50" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Annuler
                  </Button>
                  <Button>Créer la salle</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
