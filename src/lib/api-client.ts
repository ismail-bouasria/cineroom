import type {
  ApiResponse,
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  FORMULAS,
  CONSUMABLES,
} from "@/types";
import { BookingSchema } from "@/types";
import { z } from "zod";

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const ERROR_MESSAGES = {
  network: "Impossible de contacter le serveur. Vérifiez votre connexion.",
  server: "Une erreur serveur est survenue. Réessayez plus tard.",
  validation: "Les données envoyées sont invalides.",
  notFound: "Ressource introuvable.",
  unauthorized: "Vous devez être connecté pour effectuer cette action.",
  forbidden: "Vous n'avez pas les droits pour effectuer cette action.",
  unknown: "Une erreur inattendue est survenue.",
} as const;

// ============================================
// HELPERS - Création des états
// ============================================

export function createInitialState<T>(): ApiResponse<T> {
  return {
    state: "initial",
    data: null,
    error: null,
    timestamp: Date.now(),
  };
}

export function createLoadingState<T>(): ApiResponse<T> {
  return {
    state: "loading",
    data: null,
    error: null,
    timestamp: Date.now(),
  };
}

export function createSuccessState<T>(data: T): ApiResponse<T> {
  const isEmpty = Array.isArray(data) && data.length === 0;
  return {
    state: isEmpty ? "empty" : "success",
    data,
    error: null,
    timestamp: Date.now(),
  };
}

export function createErrorState<T>(error: string): ApiResponse<T> {
  return {
    state: "error",
    data: null,
    error,
    timestamp: Date.now(),
  };
}

// ============================================
// HELPERS - Vérification des états
// ============================================

export function isLoading<T>(response: ApiResponse<T>): boolean {
  return response.state === "loading";
}

export function hasError<T>(response: ApiResponse<T>): boolean {
  return response.state === "error";
}

export function isEmpty<T>(response: ApiResponse<T>): boolean {
  return response.state === "empty";
}

export function hasData<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.state === "success" && response.data !== null;
}

// ============================================
// FETCH WRAPPER
// ============================================

async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {},
  schema?: z.ZodSchema<T>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorMessage = getErrorMessage(response.status);
      return createErrorState(errorMessage);
    }

    const data = await response.json();

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error("Validation error:", result.error.issues);
        return createErrorState(ERROR_MESSAGES.validation);
      }
      return createSuccessState(result.data);
    }

    return createSuccessState(data as T);
  } catch (error) {
    console.error("Fetch error:", error);
    if (error instanceof z.ZodError) {
      return createErrorState(ERROR_MESSAGES.validation);
    }
    return createErrorState(ERROR_MESSAGES.network);
  }
}

function getErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return ERROR_MESSAGES.unauthorized;
    case 403:
      return ERROR_MESSAGES.forbidden;
    case 404:
      return ERROR_MESSAGES.notFound;
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.server;
    default:
      return ERROR_MESSAGES.unknown;
  }
}

// ============================================
// DONNÉES MOCK RÉSERVATIONS
// ============================================

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    userId: "user_1",
    movieId: 1,
    movieTitle: "Dune: Deuxième Partie",
    moviePoster: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    formula: "cine-team",
    date: "2026-02-05",
    time: "19:00",
    consumables: [
      { consumableId: "menu-team", quantity: 1 },
      { consumableId: "pop-caramel", quantity: 2 }
    ],
    totalPrice: 106,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user_1",
    movieId: 2,
    movieTitle: "Oppenheimer",
    moviePoster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    formula: "cine-duo",
    date: "2026-02-10",
    time: "20:00",
    consumables: [
      { consumableId: "menu-duo", quantity: 1 }
    ],
    totalPrice: 53,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    userId: "user_1",
    movieId: 5,
    movieTitle: "Avatar: La Voie de l'Eau",
    moviePoster: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    formula: "cine-groupe",
    date: "2026-01-15",
    time: "18:00",
    totalPrice: 100,
    status: "passee",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// ============================================
// API BOOKINGS
// ============================================

export const bookingsApi = {
  /**
   * Récupérer toutes les réservations de l'utilisateur
   */
  getAll: async (): Promise<ApiResponse<Booking[]>> => {
    // Simulation API avec données mock
    await simulateDelay();
    return createSuccessState(MOCK_BOOKINGS);
  },

  /**
   * Récupérer une réservation par ID
   */
  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    await simulateDelay();
    const booking = MOCK_BOOKINGS.find(b => b.id === id);
    if (!booking) {
      return createErrorState(ERROR_MESSAGES.notFound);
    }
    return createSuccessState(booking);
  },

  /**
   * Créer une nouvelle réservation
   */
  create: async (input: CreateBookingInput): Promise<ApiResponse<Booking>> => {
    await simulateDelay();
    
    // Calculer le prix total
    const formula = (await import("@/types")).FORMULAS.find(f => f.id === input.formula);
    let totalPrice = formula?.basePrice || 0;
    
    if (input.consumables) {
      const consumables = (await import("@/types")).CONSUMABLES;
      for (const item of input.consumables) {
        const consumable = consumables.find(c => c.id === item.consumableId);
        if (consumable) {
          totalPrice += consumable.price * item.quantity;
        }
      }
    }

    const newBooking: Booking = {
      id: String(Date.now()),
      userId: "current_user",
      movieId: input.movieId,
      movieTitle: input.movieTitle,
      moviePoster: input.moviePoster,
      formula: input.formula,
      date: input.date,
      time: input.time,
      consumables: input.consumables,
      totalPrice,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    MOCK_BOOKINGS.push(newBooking);
    return createSuccessState(newBooking);
  },

  /**
   * Modifier une réservation
   */
  update: async (id: string, input: UpdateBookingInput): Promise<ApiResponse<Booking>> => {
    await simulateDelay();
    const index = MOCK_BOOKINGS.findIndex(b => b.id === id);
    if (index === -1) {
      return createErrorState(ERROR_MESSAGES.notFound);
    }

    const updatedBooking: Booking = {
      ...MOCK_BOOKINGS[index],
      ...input,
      status: input.status || "modifiee",
      updatedAt: new Date().toISOString(),
    };

    MOCK_BOOKINGS[index] = updatedBooking;
    return createSuccessState(updatedBooking);
  },

  /**
   * Annuler une réservation
   */
  cancel: async (id: string): Promise<ApiResponse<Booking>> => {
    await simulateDelay();
    const index = MOCK_BOOKINGS.findIndex(b => b.id === id);
    if (index === -1) {
      return createErrorState(ERROR_MESSAGES.notFound);
    }

    MOCK_BOOKINGS[index] = {
      ...MOCK_BOOKINGS[index],
      status: "annulee",
      updatedAt: new Date().toISOString(),
    };

    return createSuccessState(MOCK_BOOKINGS[index]);
  },

  /**
   * Supprimer une réservation
   */
  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    await simulateDelay();
    const index = MOCK_BOOKINGS.findIndex(b => b.id === id);
    if (index === -1) {
      return createErrorState(ERROR_MESSAGES.notFound);
    }

    MOCK_BOOKINGS.splice(index, 1);
    return createSuccessState({ success: true });
  },
};

// ============================================
// API STATS (pour admin)
// ============================================

export interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  popularFormulas: { formula: string; count: number }[];
  recentBookings: Booking[];
}

export const statsApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    await simulateDelay();
    
    const stats: DashboardStats = {
      totalBookings: MOCK_BOOKINGS.length,
      activeBookings: MOCK_BOOKINGS.filter(b => b.status === "active").length,
      cancelledBookings: MOCK_BOOKINGS.filter(b => b.status === "annulee").length,
      totalRevenue: MOCK_BOOKINGS.reduce((sum, b) => sum + b.totalPrice, 0),
      popularFormulas: [
        { formula: "Ciné'Team", count: 45 },
        { formula: "Ciné'Duo", count: 32 },
        { formula: "Ciné'Groupe", count: 18 },
      ],
      recentBookings: MOCK_BOOKINGS.slice(0, 5),
    };

    return createSuccessState(stats);
  },
};

// ============================================
// HELPER
// ============================================

function simulateDelay(ms = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
