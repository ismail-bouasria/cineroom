import { z } from "zod";

// ============================================
// ENUMS & CONSTANTS
// ============================================

/**
 * Statuts de réservation conformes au contrat
 * active, modifiée, annulée, passée
 */
export const ReservationStatusEnum = z.enum([
  "active",
  "modifiee",
  "annulee",
  "passee"
]);

export type ReservationStatus = z.infer<typeof ReservationStatusEnum>;

/**
 * Formules de réservation CineRoom
 */
export const BookingFormulaEnum = z.enum([
  "cine-duo",    // 2 places
  "cine-team",   // 4 places
  "cine-groupe"  // 8+ places
]);

export type BookingFormula = z.infer<typeof BookingFormulaEnum>;

// ============================================
// CONFIGURATION DES FORMULES
// ============================================

export interface FormulaConfig {
  id: BookingFormula;
  name: string;
  description: string;
  seats: number;
  basePrice: number;
  icon: string;
  color: string;
  popular?: boolean;
}

export const FORMULAS: FormulaConfig[] = [
  {
    id: "cine-duo",
    name: "Ciné'Duo",
    description: "L'intimité parfaite pour deux",
    seats: 2,
    basePrice: 35,
    icon: "❤️",
    color: "from-pink-500 to-rose-600"
  },
  {
    id: "cine-team",
    name: "Ciné'Team",
    description: "Entre amis ou en famille",
    seats: 4,
    basePrice: 60,
    icon: "👥",
    color: "from-violet-500 to-purple-600",
    popular: true
  },
  {
    id: "cine-groupe",
    name: "Ciné'Groupe",
    description: "Pour les grandes occasions",
    seats: 8,
    basePrice: 100,
    icon: "🎉",
    color: "from-amber-500 to-orange-600"
  }
];

// ============================================
// CONSOMMABLES
// ============================================

export const ConsumableCategoryEnum = z.enum([
  "popcorn",
  "boissons",
  "snacks",
  "menus"
]);

export type ConsumableCategory = z.infer<typeof ConsumableCategoryEnum>;

export const ConsumableSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
  category: ConsumableCategoryEnum,
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().default(true)
});

export type Consumable = z.infer<typeof ConsumableSchema>;

export const CONSUMABLES: Consumable[] = [
  // Popcorn
  { id: "pop-s", name: "Popcorn S", price: 4.5, category: "popcorn", isAvailable: true },
  { id: "pop-m", name: "Popcorn M", price: 6, category: "popcorn", isAvailable: true },
  { id: "pop-l", name: "Popcorn L", price: 8, category: "popcorn", isAvailable: true },
  { id: "pop-caramel", name: "Popcorn Caramel", price: 7, category: "popcorn", isAvailable: true },
  // Boissons
  { id: "soda-s", name: "Soda S", price: 3.5, category: "boissons", isAvailable: true },
  { id: "soda-m", name: "Soda M", price: 4.5, category: "boissons", isAvailable: true },
  { id: "soda-l", name: "Soda L", price: 5.5, category: "boissons", isAvailable: true },
  { id: "water", name: "Eau Minérale", price: 2.5, category: "boissons", isAvailable: true },
  { id: "ice-tea", name: "Ice Tea", price: 4, category: "boissons", isAvailable: true },
  // Snacks
  { id: "nachos", name: "Nachos", price: 6.5, category: "snacks", isAvailable: true },
  { id: "churros", name: "Churros", price: 5, category: "snacks", isAvailable: true },
  { id: "candy", name: "Bonbons", price: 3, category: "snacks", isAvailable: true },
  { id: "ice-cream", name: "Glace", price: 4, category: "snacks", isAvailable: true },
  // Menus
  { id: "menu-duo", name: "Menu Duo", description: "2 Popcorn M + 2 Sodas M", price: 18, category: "menus", isAvailable: true },
  { id: "menu-team", name: "Menu Team", description: "2 Popcorn L + 4 Sodas M", price: 32, category: "menus", isAvailable: true },
  { id: "menu-premium", name: "Menu Premium", description: "Popcorn XL + Nachos + 2 Sodas L", price: 25, category: "menus", isAvailable: true }
];

// ============================================
// SCHEMAS FILMS (TMDB)
// ============================================

export const TMDBMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().optional(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  genre_ids: z.array(z.number()).optional(),
  adult: z.boolean().optional(),
  popularity: z.number().optional()
});

export type TMDBMovie = z.infer<typeof TMDBMovieSchema>;

export const TMDBGenreSchema = z.object({
  id: z.number(),
  name: z.string()
});

export type TMDBGenre = z.infer<typeof TMDBGenreSchema>;

// ============================================
// CRÉNEAUX HORAIRES
// ============================================

export const TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

export interface TimeSlot {
  time: string;
  available: boolean;
}

// ============================================
// SCHEMAS RÉSERVATION
// ============================================

export const BookingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userEmail: z.string().email().optional(),
  movieId: z.number(),
  movieTitle: z.string(),
  moviePoster: z.string().nullable().optional(),
  formula: BookingFormulaEnum,
  date: z.string(),
  time: z.string(),
  consumables: z.array(z.object({
    consumableId: z.string(),
    quantity: z.number().int().positive()
  })).optional(),
  totalPrice: z.number().positive(),
  status: ReservationStatusEnum,
  specialRequests: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

export type Booking = z.infer<typeof BookingSchema>;

/**
 * Schéma pour créer une réservation
 */
export const CreateBookingInputSchema = z.object({
  movieId: z.number(),
  movieTitle: z.string(),
  moviePoster: z.string().nullable().optional(),
  formula: BookingFormulaEnum,
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  consumables: z.array(z.object({
    consumableId: z.string(),
    quantity: z.number().int().positive()
  })).optional(),
  specialRequests: z.string().optional()
});

export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>;

/**
 * Schéma pour modifier une réservation
 */
export const UpdateBookingInputSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional(),
  formula: BookingFormulaEnum.optional(),
  consumables: z.array(z.object({
    consumableId: z.string(),
    quantity: z.number().int().positive()
  })).optional(),
  specialRequests: z.string().optional(),
  status: ReservationStatusEnum.optional()
});

export type UpdateBookingInput = z.infer<typeof UpdateBookingInputSchema>;

// ============================================
// TYPES API - Gestion des 5 états
// ============================================

/**
 * États possibles d'une requête API
 * Conforme au contrat : Initial, Chargement, Succès, Erreur, Vide
 */
export type RequestState =
  | "initial"
  | "loading"
  | "success"
  | "error"
  | "empty";

/**
 * Type générique pour les réponses API avec gestion des 5 états
 */
export type ApiResponse<T> = {
  state: RequestState;
  data: T | null;
  error: string | null;
  timestamp: number;
};

// ============================================
// TYPES UTILITAIRES
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  status?: ReservationStatus;
  movieId?: number;
  dateFrom?: string;
  dateTo?: string;
  formula?: BookingFormula;
  search?: string;
}

// ============================================
// GENRES TMDB (ID -> Nom)
// ============================================

export const TMDB_GENRES: Record<number, string> = {
  28: "Action",
  12: "Aventure",
  16: "Animation",
  35: "Comédie",
  80: "Crime",
  99: "Documentaire",
  18: "Drame",
  10751: "Familial",
  14: "Fantastique",
  36: "Histoire",
  27: "Horreur",
  10402: "Musique",
  9648: "Mystère",
  10749: "Romance",
  878: "Science-Fiction",
  10770: "Téléfilm",
  53: "Thriller",
  10752: "Guerre",
  37: "Western"
};
