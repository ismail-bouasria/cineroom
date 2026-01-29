import type {
  ApiResponse,
  Booking,
  CreateBookingInput,
  Room,
  UpdateBookingInput,
} from "@/types";
import { BookingSchema, RoomSchema } from "@/types";
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
// API ROOMS
// ============================================

export const roomsApi = {
  async getAll(): Promise<ApiResponse<Room[]>> {
    return fetchWithErrorHandling("/rooms", {}, z.array(RoomSchema));
  },

  async getById(id: string): Promise<ApiResponse<Room>> {
    return fetchWithErrorHandling(`/rooms/${id}`, {}, RoomSchema);
  },

  async create(data: Partial<Room>): Promise<ApiResponse<Room>> {
    return fetchWithErrorHandling(
      "/rooms",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      RoomSchema
    );
  },

  async update(id: string, data: Partial<Room>): Promise<ApiResponse<Room>> {
    return fetchWithErrorHandling(
      `/rooms/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      RoomSchema
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return fetchWithErrorHandling(`/rooms/${id}`, { method: "DELETE" });
  },
};

// ============================================
// API BOOKINGS
// ============================================

export const bookingsApi = {
  async getAll(): Promise<ApiResponse<Booking[]>> {
    return fetchWithErrorHandling("/bookings", {}, z.array(BookingSchema));
  },

  async getById(id: string): Promise<ApiResponse<Booking>> {
    return fetchWithErrorHandling(`/bookings/${id}`, {}, BookingSchema);
  },

  async create(data: CreateBookingInput): Promise<ApiResponse<Booking>> {
    return fetchWithErrorHandling(
      "/bookings",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      BookingSchema
    );
  },

  async update(id: string, data: UpdateBookingInput): Promise<ApiResponse<Booking>> {
    return fetchWithErrorHandling(
      `/bookings/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      BookingSchema
    );
  },

  async cancel(id: string): Promise<ApiResponse<Booking>> {
    return fetchWithErrorHandling(
      `/bookings/${id}/cancel`,
      { method: "POST" },
      BookingSchema
    );
  },
};
