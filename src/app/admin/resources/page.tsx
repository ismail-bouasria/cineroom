'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Film, Clock, Calendar, Power, PowerOff, 
  Edit, Save, X, Users, Plus, Trash2, AlertCircle 
} from 'lucide-react';
import { FORMULAS, FormulaConfig, TIME_SLOTS } from '@/types';

// ============================================
// TYPES LOCAUX
// ============================================

interface ResourceConfig extends FormulaConfig {
  isActive: boolean;
  availableDays: number[]; // 0 = Dimanche, 1 = Lundi, etc.
  availableTimeSlots: string[];
}

// ============================================
// DONNÉES MOCKÉES
// ============================================

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lundi', short: 'L' },
  { id: 2, name: 'Mardi', short: 'M' },
  { id: 3, name: 'Mercredi', short: 'Me' },
  { id: 4, name: 'Jeudi', short: 'J' },
  { id: 5, name: 'Vendredi', short: 'V' },
  { id: 6, name: 'Samedi', short: 'S' },
  { id: 0, name: 'Dimanche', short: 'D' }
];

const initialResources: ResourceConfig[] = FORMULAS.map(f => ({
  ...f,
  isActive: true,
  availableDays: [1, 2, 3, 4, 5, 6, 0], // Tous les jours
  availableTimeSlots: TIME_SLOTS
}));

// ============================================
// COMPOSANTS
// ============================================

const ResourceCard = ({
  resource,
  onToggleActive,
  onEdit
}: {
  resource: ResourceConfig;
  onToggleActive: () => void;
  onEdit: () => void;
}) => (
  <div className={`bg-white/5 rounded-2xl overflow-hidden border transition-all ${
    resource.isActive ? 'border-white/10' : 'border-red-500/30 opacity-60'
  }`}>
    {/* Header avec couleur */}
    <div className={`p-6 bg-gradient-to-br ${resource.color}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-4xl">{resource.icon}</span>
          <h3 className="text-2xl font-bold mt-2">{resource.name}</h3>
          <p className="text-white/70">{resource.description}</p>
        </div>
        <button
          onClick={onToggleActive}
          className={`p-2 rounded-lg transition-colors ${
            resource.isActive 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
          title={resource.isActive ? 'Désactiver' : 'Activer'}
        >
          {resource.isActive ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
        </button>
      </div>
    </div>

    {/* Info */}
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Capacité
        </span>
        <span className="font-bold">{resource.seats} places</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Prix</span>
        <span className="font-bold text-xl">{resource.basePrice}€</span>
      </div>

      <div>
        <span className="text-gray-400 flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4" />
          Jours disponibles
        </span>
        <div className="flex gap-1">
          {DAYS_OF_WEEK.map(day => (
            <span
              key={day.id}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                resource.availableDays.includes(day.id)
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/5 text-gray-600'
              }`}
            >
              {day.short}
            </span>
          ))}
        </div>
      </div>

      <div>
        <span className="text-gray-400 flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4" />
          Créneaux ({resource.availableTimeSlots.length})
        </span>
        <p className="text-sm text-gray-500">
          {resource.availableTimeSlots[0]} - {resource.availableTimeSlots[resource.availableTimeSlots.length - 1]}
        </p>
      </div>

      <button
        onClick={onEdit}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
      >
        <Edit className="w-4 h-4" />
        Modifier
      </button>
    </div>
  </div>
);

// Modal d'édition
const EditResourceModal = ({
  resource,
  onSave,
  onClose
}: {
  resource: ResourceConfig;
  onSave: (updated: ResourceConfig) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<ResourceConfig>({ ...resource });

  const toggleDay = (dayId: number) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(dayId)
        ? prev.availableDays.filter(d => d !== dayId)
        : [...prev.availableDays, dayId]
    }));
  };

  const toggleTimeSlot = (time: string) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.includes(time)
        ? prev.availableTimeSlots.filter(t => t !== time)
        : [...prev.availableTimeSlots, time].sort()
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1a1a1a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold">Modifier {resource.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Prix (€)
            </label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Jours disponibles */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Jours disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.availableDays.includes(day.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </div>

          {/* Créneaux horaires */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Créneaux horaires
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {TIME_SLOTS.map(time => (
                <button
                  key={time}
                  onClick={() => toggleTimeSlot(time)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.availableTimeSlots.includes(time)
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection rapide */}
          <div className="flex gap-2">
            <button
              onClick={() => setFormData(prev => ({ ...prev, availableTimeSlots: TIME_SLOTS }))}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              Tous les créneaux
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, availableTimeSlots: TIME_SLOTS.filter(t => parseInt(t) >= 14) }))}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              Après-midi seulement
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, availableTimeSlots: [] }))}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              Aucun
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1a1a] p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
          >
            <Save className="w-5 h-5" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PAGE GESTION DES RESSOURCES
// ============================================

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceConfig[]>(initialResources);
  const [editingResource, setEditingResource] = useState<ResourceConfig | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const toggleResourceActive = (resourceId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, isActive: !r.isActive } : r
    ));
    const resource = resources.find(r => r.id === resourceId);
    setNotification(`${resource?.name} ${resource?.isActive ? 'désactivée' : 'activée'}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const saveResource = (updated: ResourceConfig) => {
    setResources(prev => prev.map(r => 
      r.id === updated.id ? updated : r
    ));
    setEditingResource(null);
    setNotification(`${updated.name} mise à jour`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
              <span className="font-bold">Gestion des ressources</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-right">
          <AlertCircle className="w-5 h-5" />
          {notification}
        </div>
      )}

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black">Formules & Salles</h1>
          <p className="text-gray-400 mt-1">
            Gérez les formules de réservation, leurs prix et disponibilités
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {resources.filter(r => r.isActive).length}
            </p>
            <p className="text-sm text-gray-400">Formules actives</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">
              {resources.reduce((sum, r) => sum + r.seats, 0)}
            </p>
            <p className="text-sm text-gray-400">Places totales</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">
              {Math.round(resources.reduce((sum, r) => sum + r.basePrice, 0) / resources.length)}€
            </p>
            <p className="text-sm text-gray-400">Prix moyen</p>
          </div>
        </div>

        {/* Grille des ressources */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onToggleActive={() => toggleResourceActive(resource.id)}
              onEdit={() => setEditingResource(resource)}
            />
          ))}
        </div>
      </main>

      {/* Modal d'édition */}
      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          onSave={saveResource}
          onClose={() => setEditingResource(null)}
        />
      )}
    </div>
  );
}
