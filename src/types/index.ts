import { z } from "zod";

// ============================================
// ENUMS & CONSTANTS
// ============================================

export const ReservationStatusEnum = z.enum([
  "pending",
  "confirmed", 
  "cancelled",
  "completed"
]);

export type ReservationStatus = z.infer<typeof ReservationStatusEnum>;

// ============================================
// SCHEMAS ZOD - Validation des données
// ============================================

/**
 * Schéma de validation pour une salle de cinéma
 */
export const RoomSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().optional(),
  capacity: z.number().int().positive("La capacité doit être positive"),
  pricePerHour: z.number().positive("Le prix doit être positif"),
  isAvailable: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
  equipment: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Room = z.infer<typeof RoomSchema>;

/**
 * Schéma de validation pour une réservation
 */
export const BookingSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  roomName: z.string().optional(),
  userId: z.string().optional(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  numberOfGuests: z.number().int().positive(),
  specialRequests: z.string().optional(),
  totalPrice: z.number(),
  status: ReservationStatusEnum,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Booking = z.infer<typeof BookingSchema>;

/**
 * Schéma pour la création d'une réservation
 */
export const CreateBookingInputSchema = z.object({
  roomId: z.string().min(1, "ID de salle requis"),
  date: z.string().min(1, "La date est requise"),
  startTime: z.string().min(1, "L'heure de début est requise"),
  endTime: z.string().min(1, "L'heure de fin est requise"),
  numberOfGuests: z.number().int().positive("Nombre d'invités requis"),
  specialRequests: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>;

/**
 * Schéma pour la modification d'une réservation
 */
export const UpdateBookingInputSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  numberOfGuests: z.number().int().positive().optional(),
  specialRequests: z.string().optional(),
  status: ReservationStatusEnum.optional(),
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
  roomId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
