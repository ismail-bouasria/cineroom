'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { CONSUMABLES, Consumable, ConsumableCategory } from '@/types';

// ============================================
// TYPES
// ============================================

export interface ConsumableSelection {
  consumableId: string;
  quantity: number;
}

interface ConsumableSelectorProps {
  selections: ConsumableSelection[];
  onChange: (selections: ConsumableSelection[]) => void;
  maxPerItem?: number;
}

// ============================================
// CONFIGURATION CATÉGORIES
// ============================================

const CATEGORY_CONFIG: Record<ConsumableCategory, { label: string; icon: string }> = {
  popcorn: { label: 'Popcorn', icon: '🍿' },
  boissons: { label: 'Boissons', icon: '🥤' },
  snacks: { label: 'Snacks', icon: '🍫' },
  menus: { label: 'Menus', icon: '🎁' }
};

const CATEGORIES: ConsumableCategory[] = ['menus', 'popcorn', 'boissons', 'snacks'];

// ============================================
// COMPOSANT ITEM
// ============================================

function ConsumableItem({
  consumable,
  quantity,
  onAdd,
  onRemove,
  maxQuantity
}: {
  consumable: Consumable;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  maxQuantity: number;
}) {
  return (
    <div className={`
      relative p-4 rounded-xl transition-all
      ${quantity > 0 
        ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30' 
        : 'bg-white/5 hover:bg-white/10 border border-transparent'
      }
    `}>
      {/* Badge quantité */}
      {quantity > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
          {quantity}
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Info produit */}
        <div className="flex-1">
          <h4 className="font-semibold text-white">{consumable.name}</h4>
          {consumable.description && (
            <p className="text-sm text-gray-400 mt-1">{consumable.description}</p>
          )}
          <p className="text-lg font-bold text-red-400 mt-2">{consumable.price.toFixed(2)}€</p>
        </div>

        {/* Contrôles quantité */}
        <div className="flex items-center gap-2">
          {quantity > 0 ? (
            <>
              <button
                onClick={onRemove}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Retirer"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button
                onClick={onAdd}
                disabled={quantity >= maxQuantity}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Ajouter"
              >
                <Plus size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function ConsumableSelector({
  selections,
  onChange,
  maxPerItem = 10
}: ConsumableSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<ConsumableCategory>('menus');

  const getQuantity = (consumableId: string): number => {
    return selections.find(s => s.consumableId === consumableId)?.quantity || 0;
  };

  const updateQuantity = (consumableId: string, delta: number) => {
    const currentQuantity = getQuantity(consumableId);
    const newQuantity = Math.max(0, Math.min(maxPerItem, currentQuantity + delta));

    if (newQuantity === 0) {
      onChange(selections.filter(s => s.consumableId !== consumableId));
    } else {
      const existing = selections.find(s => s.consumableId === consumableId);
      if (existing) {
        onChange(selections.map(s =>
          s.consumableId === consumableId ? { ...s, quantity: newQuantity } : s
        ));
      } else {
        onChange([...selections, { consumableId, quantity: newQuantity }]);
      }
    }
  };

  const totalItems = selections.reduce((sum, s) => sum + s.quantity, 0);
  const totalPrice = selections.reduce((sum, s) => {
    const consumable = CONSUMABLES.find(c => c.id === s.consumableId);
    return sum + (consumable?.price || 0) * s.quantity;
  }, 0);

  const filteredConsumables = CONSUMABLES.filter(c => c.category === activeCategory && c.isAvailable);

  return (
    <div className="space-y-6">
      {/* En-tête avec total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-red-500" size={24} />
          <h3 className="text-xl font-bold">Consommables</h3>
          <span className="text-gray-400 text-sm">(optionnel)</span>
        </div>
        
        {totalItems > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{totalItems} article{totalItems > 1 ? 's' : ''}</span>
            <span className="text-lg font-bold text-red-400">+{totalPrice.toFixed(2)}€</span>
          </div>
        )}
      </div>

      {/* Onglets catégories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(category => {
          const config = CATEGORY_CONFIG[category];
          const categoryItems = selections.filter(s => {
            const consumable = CONSUMABLES.find(c => c.id === s.consumableId);
            return consumable?.category === category;
          });
          const categoryCount = categoryItems.reduce((sum, s) => sum + s.quantity, 0);

          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${activeCategory === category
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
                }
              `}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              {categoryCount > 0 && (
                <span className="ml-1 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
                  {categoryCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Liste des produits */}
      <div className="grid gap-3">
        {filteredConsumables.map(consumable => (
          <ConsumableItem
            key={consumable.id}
            consumable={consumable}
            quantity={getQuantity(consumable.id)}
            onAdd={() => updateQuantity(consumable.id, 1)}
            onRemove={() => updateQuantity(consumable.id, -1)}
            maxQuantity={maxPerItem}
          />
        ))}
      </div>

      {filteredConsumables.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          Aucun article disponible dans cette catégorie
        </p>
      )}
    </div>
  );
}

// ============================================
// MINI SÉLECTEUR (pour récapitulatif)
// ============================================

export function ConsumableSummary({ selections }: { selections: ConsumableSelection[] }) {
  if (selections.length === 0) return null;

  const items = selections.map(s => {
    const consumable = CONSUMABLES.find(c => c.id === s.consumableId);
    return consumable ? { ...consumable, quantity: s.quantity } : null;
  }).filter(Boolean);

  const total = items.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <ShoppingBag size={18} className="text-red-400" />
        Consommables
      </h4>
      <div className="space-y-2">
        {items.map(item => item && (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {item.quantity}x {item.name}
            </span>
            <span className="text-gray-400">
              {(item.price * item.quantity).toFixed(2)}€
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between font-semibold">
        <span>Sous-total</span>
        <span className="text-red-400">{total.toFixed(2)}€</span>
      </div>
    </div>
  );
}

export default ConsumableSelector;
