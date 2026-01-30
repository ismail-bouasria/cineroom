// ============================================
// API CLIENT - CineRoom (GraphQL)
// Client API utilisant GraphQL avec données persistantes
// ============================================

import type {
  ApiResponse,
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/types";
import type { EmailNotificationType } from "@/lib/email";

// ============================================
// CONFIGURATION
// ============================================

const GRAPHQL_ENDPOINT = '/api/graphql';

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
// GRAPHQL CLIENT
// ============================================

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors?.length) {
      const error = result.errors[0];
      const code = error.extensions?.code;
      
      if (code === 'UNAUTHENTICATED') return { error: ERROR_MESSAGES.unauthorized };
      if (code === 'FORBIDDEN') return { error: ERROR_MESSAGES.forbidden };
      
      return { error: error.message || ERROR_MESSAGES.unknown };
    }

    return { data: result.data };
  } catch (error) {
    console.error('GraphQL request error:', error);
    return { error: ERROR_MESSAGES.network };
  }
}

// ============================================
// ENVOI DE NOTIFICATIONS EMAIL
// ============================================

interface SendEmailNotificationParams {
  type: EmailNotificationType;
  booking: Booking;
}

async function sendEmailNotification(params: SendEmailNotificationParams): Promise<void> {
  try {
    console.log(`[Email] Envoi notification ${params.type} pour réservation ${params.booking.id}`);
    
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.warn('[Email] Échec de l\'envoi:', responseData);
    } else {
      console.log(`[Email] "${params.type}" envoyé avec succès:`, responseData);
    }
  } catch (error) {
    console.warn('[Email] Erreur lors de l\'envoi de l\'email de notification:', error);
  }
}

// ============================================
// GRAPHQL QUERIES
// ============================================

const QUERIES = {
  MY_BOOKINGS: `
    query MyBookings($filters: BookingFilters, $pagination: PaginationInput) {
      myBookings(filters: $filters, pagination: $pagination) {
        items {
          id
          movieId
          movieTitle
          moviePoster
          formula
          date
          time
          roomNumber
          totalPrice
          status
          specialRequests
          consumables {
            id
            quantity
            consumable { id name price category }
          }
          user { id email firstName lastName }
          createdAt
          updatedAt
        }
        total
        page
        pageSize
        totalPages
      }
    }
  `,

  BOOKING: `
    query Booking($id: ID!) {
      booking(id: $id) {
        id
        movieId
        movieTitle
        moviePoster
        formula
        date
        time
        roomNumber
        totalPrice
        status
        specialRequests
        consumables {
          id
          quantity
          consumable { id name price category }
        }
        user { id email firstName lastName }
        createdAt
        updatedAt
      }
    }
  `,

  ALL_BOOKINGS: `
    query AllBookings($filters: BookingFilters, $pagination: PaginationInput) {
      allBookings(filters: $filters, pagination: $pagination) {
        items {
          id
          movieId
          movieTitle
          moviePoster
          formula
          date
          time
          totalPrice
          status
          user { id email firstName lastName }
          consumables {
            id
            quantity
            consumable { id name price }
          }
          createdAt
        }
        total
        page
        pageSize
        totalPages
      }
    }
  `,

  DASHBOARD_STATS: `
    query DashboardStats {
      dashboardStats {
        totalBookings
        activeBookings
        totalRevenue
        totalUsers
        bookingsByFormula { formula count revenue }
        bookingsByStatus { status count }
        recentBookings {
          id
          movieTitle
          moviePoster
          formula
          date
          time
          totalPrice
          status
          user { email firstName lastName }
        }
        monthlyRevenue { month revenue bookings }
      }
    }
  `,

  USERS: `
    query Users($pagination: PaginationInput) {
      users(pagination: $pagination) {
        items { id clerkId email firstName lastName role createdAt }
        total
        page
        pageSize
        totalPages
      }
    }
  `,

  CHECK_AVAILABILITY: `
    query CheckAvailability($date: String!, $time: String!, $formula: String) {
      checkAvailability(date: $date, time: $time, formula: $formula)
    }
  `,

  CAN_MODIFY_BOOKING: `
    query CanModifyBooking($bookingId: ID!) {
      canModifyBooking(bookingId: $bookingId)
    }
  `,

  GET_SLOT_AVAILABILITY: `
    query GetSlotAvailability($date: String!, $time: String!) {
      getSlotAvailability(date: $date, time: $time) {
        date
        time
        formulas {
          formula
          totalRooms
          bookedRooms
          availableRooms
          isAvailable
        }
        totalAvailableRooms
        isCompletelyBooked
      }
    }
  `,

  GET_AVAILABLE_TIME_SLOTS: `
    query GetAvailableTimeSlots($date: String!, $formula: String!) {
      getAvailableTimeSlots(date: $date, formula: $formula) {
        time
        isAvailable
        availableRooms
        totalRooms
        bookedRooms
      }
    }
  `,
};

const MUTATIONS = {
  CREATE_BOOKING: `
    mutation CreateBooking($input: CreateBookingInput!) {
      createBooking(input: $input) {
        id
        movieId
        movieTitle
        moviePoster
        formula
        date
        time
        roomNumber
        totalPrice
        status
        consumables {
          id
          quantity
          consumable { id name price }
        }
        user { id email firstName lastName }
        createdAt
      }
    }
  `,

  UPDATE_BOOKING: `
    mutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {
      updateBooking(id: $id, input: $input) {
        id
        movieId
        movieTitle
        moviePoster
        formula
        date
        time
        roomNumber
        totalPrice
        status
        consumables {
          id
          quantity
          consumable { id name price }
        }
        user { id email firstName lastName }
        updatedAt
      }
    }
  `,

  CANCEL_BOOKING: `
    mutation CancelBooking($id: ID!) {
      cancelBooking(id: $id) {
        id
        movieId
        movieTitle
        moviePoster
        formula
        date
        time
        roomNumber
        totalPrice
        status
        specialRequests
        consumables {
          id
          quantity
          consumable { id name price category }
        }
        user { id email firstName lastName }
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_BOOKING_STATUS: `
    mutation UpdateBookingStatus($id: ID!, $status: ReservationStatus!) {
      updateBookingStatus(id: $id, status: $status) {
        id
        status
      }
    }
  `,

  DELETE_BOOKING: `
    mutation DeleteBooking($id: ID!) {
      deleteBooking(id: $id)
    }
  `,

  UPDATE_USER_ROLE: `
    mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
      updateUserRole(userId: $userId, role: $role) {
        id
        role
      }
    }
  `,
};

// ============================================
// HELPER: Transformer les données GraphQL
// ============================================

interface GraphQLBookingConsumable {
  id: string;
  quantity: number;
  consumable: { id: string; name: string; price: number; category?: string };
}

interface GraphQLBooking {
  id: string;
  movieId: number;
  movieTitle: string;
  moviePoster?: string | null;
  formula: string;
  date: string;
  time: string;
  roomNumber: number;
  totalPrice: number;
  status: string;
  specialRequests?: string;
  consumables?: GraphQLBookingConsumable[];
  user?: { id: string; email: string; firstName?: string; lastName?: string };
  createdAt: string;
  updatedAt?: string;
}

function transformBooking(gqlBooking: GraphQLBooking): Booking {
  return {
    id: gqlBooking.id,
    userId: gqlBooking.user?.id || '',
    userEmail: gqlBooking.user?.email,
    movieId: gqlBooking.movieId,
    movieTitle: gqlBooking.movieTitle,
    moviePoster: gqlBooking.moviePoster,
    formula: gqlBooking.formula as Booking['formula'],
    date: gqlBooking.date,
    time: gqlBooking.time,
    roomNumber: gqlBooking.roomNumber,
    totalPrice: gqlBooking.totalPrice,
    status: gqlBooking.status as Booking['status'],
    specialRequests: gqlBooking.specialRequests,
    consumables: gqlBooking.consumables?.map(c => ({
      consumableId: c.consumable.id,
      quantity: c.quantity,
    })),
    createdAt: gqlBooking.createdAt,
    updatedAt: gqlBooking.updatedAt,
  };
}

// ============================================
// API BOOKINGS
// ============================================

export const bookingsApi = {
  /**
   * Récupérer toutes les réservations de l'utilisateur connecté
   */
  getAll: async (): Promise<ApiResponse<Booking[]>> => {
    const { data, error } = await graphqlRequest<{
      myBookings: { items: GraphQLBooking[] };
    }>(QUERIES.MY_BOOKINGS, { pagination: { page: 1, pageSize: 100 } });

    if (error) return createErrorState(error);
    if (!data) return createErrorState(ERROR_MESSAGES.unknown);

    const bookings = data.myBookings.items.map(transformBooking);
    return createSuccessState(bookings);
  },

  /**
   * Récupérer une réservation par ID
   */
  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    const { data, error } = await graphqlRequest<{
      booking: GraphQLBooking;
    }>(QUERIES.BOOKING, { id });

    if (error) return createErrorState(error);
    if (!data?.booking) return createErrorState(ERROR_MESSAGES.notFound);

    return createSuccessState(transformBooking(data.booking));
  },

  /**
   * Créer une nouvelle réservation
   */
  create: async (input: CreateBookingInput): Promise<ApiResponse<Booking>> => {
    const { data, error } = await graphqlRequest<{
      createBooking: GraphQLBooking;
    }>(MUTATIONS.CREATE_BOOKING, {
      input: {
        movieId: input.movieId,
        movieTitle: input.movieTitle,
        moviePoster: input.moviePoster,
        formula: input.formula,
        date: input.date,
        time: input.time,
        roomNumber: input.roomNumber,
        consumables: input.consumables?.map(c => ({
          consumableId: c.consumableId,
          quantity: c.quantity,
        })),
        specialRequests: input.specialRequests,
      },
    });

    if (error) return createErrorState(error);
    if (!data?.createBooking) return createErrorState(ERROR_MESSAGES.unknown);

    const booking = transformBooking(data.createBooking);

    // Envoyer l'email de confirmation
    sendEmailNotification({ type: 'booking_created', booking });

    return createSuccessState(booking);
  },

  /**
   * Vérifier si l'utilisateur peut modifier/annuler une réservation (règle des 2h)
   */
  canModify: async (bookingId: string): Promise<ApiResponse<boolean>> => {
    const { data, error } = await graphqlRequest<{
      canModifyBooking: boolean;
    }>(QUERIES.CAN_MODIFY_BOOKING, { bookingId });

    if (error) return createErrorState(error);
    
    return createSuccessState(data?.canModifyBooking ?? false);
  },

  /**
   * Modifier une réservation
   */
  update: async (id: string, input: UpdateBookingInput): Promise<ApiResponse<Booking>> => {
    const { data, error } = await graphqlRequest<{
      updateBooking: GraphQLBooking;
    }>(MUTATIONS.UPDATE_BOOKING, {
      id,
      input: {
        date: input.date,
        time: input.time,
        roomNumber: input.roomNumber,
        formula: input.formula,
        consumables: input.consumables?.map(c => ({
          consumableId: c.consumableId,
          quantity: c.quantity,
        })),
        specialRequests: input.specialRequests,
        status: input.status,
      },
    });

    if (error) return createErrorState(error);
    if (!data?.updateBooking) return createErrorState(ERROR_MESSAGES.unknown);

    const booking = transformBooking(data.updateBooking);

    // Envoyer l'email de modification
    sendEmailNotification({ type: 'booking_modified', booking });

    return createSuccessState(booking);
  },

  /**
   * Annuler une réservation
   */
  cancel: async (id: string): Promise<ApiResponse<Booking>> => {
    const { data, error } = await graphqlRequest<{
      cancelBooking: GraphQLBooking;
    }>(MUTATIONS.CANCEL_BOOKING, { id });

    if (error) return createErrorState(error);
    if (!data?.cancelBooking) return createErrorState(ERROR_MESSAGES.unknown);

    const booking = transformBooking(data.cancelBooking);

    // Envoyer l'email d'annulation
    sendEmailNotification({ type: 'booking_cancelled', booking });

    return createSuccessState(booking);
  },

  /**
   * Supprimer une réservation (admin)
   */
  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    // D'abord récupérer la réservation pour l'email
    const bookingResult = await bookingsApi.getById(id);
    
    const { data, error } = await graphqlRequest<{
      deleteBooking: boolean;
    }>(MUTATIONS.DELETE_BOOKING, { id });

    if (error) return createErrorState(error);
    if (!data?.deleteBooking) return createErrorState(ERROR_MESSAGES.unknown);

    // Envoyer l'email de suppression si on avait les données
    if (hasData(bookingResult)) {
      sendEmailNotification({ type: 'booking_deleted', booking: bookingResult.data });
    }

    return createSuccessState({ success: true });
  },
};

// ============================================
// API ADMIN
// ============================================

export const adminApi = {
  /**
   * Récupérer toutes les réservations (admin)
   */
  getAllBookings: async (filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<Booking[]>> => {
    const { data, error } = await graphqlRequest<{
      allBookings: { items: GraphQLBooking[]; total: number };
    }>(QUERIES.ALL_BOOKINGS, {
      filters,
      pagination: { page: 1, pageSize: 100 },
    });

    if (error) return createErrorState(error);
    if (!data) return createErrorState(ERROR_MESSAGES.unknown);

    const bookings = data.allBookings.items.map(transformBooking);
    return createSuccessState(bookings);
  },

  /**
   * Mettre à jour le statut d'une réservation
   */
  updateBookingStatus: async (id: string, status: string): Promise<ApiResponse<{ id: string; status: string }>> => {
    const { data, error } = await graphqlRequest<{
      updateBookingStatus: { id: string; status: string };
    }>(MUTATIONS.UPDATE_BOOKING_STATUS, { id, status });

    if (error) return createErrorState(error);
    if (!data?.updateBookingStatus) return createErrorState(ERROR_MESSAGES.unknown);

    return createSuccessState(data.updateBookingStatus);
  },

  /**
   * Récupérer tous les utilisateurs
   */
  getUsers: async (): Promise<ApiResponse<Array<{
    id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    createdAt: string;
  }>>> => {
    const { data, error } = await graphqlRequest<{
      users: { items: Array<{
        id: string;
        clerkId: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        createdAt: string;
      }> };
    }>(QUERIES.USERS, { pagination: { page: 1, pageSize: 100 } });

    if (error) return createErrorState(error);
    if (!data) return createErrorState(ERROR_MESSAGES.unknown);

    return createSuccessState(data.users.items);
  },

  /**
   * Mettre à jour le rôle d'un utilisateur
   */
  updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<ApiResponse<{ id: string; role: string }>> => {
    const { data, error } = await graphqlRequest<{
      updateUserRole: { id: string; role: string };
    }>(MUTATIONS.UPDATE_USER_ROLE, { userId, role });

    if (error) return createErrorState(error);
    if (!data?.updateUserRole) return createErrorState(ERROR_MESSAGES.unknown);

    return createSuccessState(data.updateUserRole);
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
  totalUsers: number;
  popularFormulas: { formula: string; count: number; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
  recentBookings: Booking[];
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
}

export const statsApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const { data, error } = await graphqlRequest<{
      dashboardStats: {
        totalBookings: number;
        activeBookings: number;
        totalRevenue: number;
        totalUsers: number;
        bookingsByFormula: { formula: string; count: number; revenue: number }[];
        bookingsByStatus: { status: string; count: number }[];
        recentBookings: GraphQLBooking[];
        monthlyRevenue: { month: string; revenue: number; bookings: number }[];
      };
    }>(QUERIES.DASHBOARD_STATS);

    if (error) return createErrorState(error);
    if (!data?.dashboardStats) return createErrorState(ERROR_MESSAGES.unknown);

    const s = data.dashboardStats;
    const cancelledCount = s.bookingsByStatus.find(b => b.status === 'annulee')?.count || 0;

    const stats: DashboardStats = {
      totalBookings: s.totalBookings,
      activeBookings: s.activeBookings,
      cancelledBookings: cancelledCount,
      totalRevenue: s.totalRevenue,
      totalUsers: s.totalUsers,
      popularFormulas: s.bookingsByFormula,
      bookingsByStatus: s.bookingsByStatus,
      recentBookings: s.recentBookings.map(transformBooking),
      monthlyRevenue: s.monthlyRevenue,
    };

    return createSuccessState(stats);
  },
};

// ============================================
// API AVAILABILITY
// ============================================

export interface FormulaAvailability {
  formula: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
  isAvailable: boolean;
}

export interface SlotAvailability {
  date: string;
  time: string;
  formulas: FormulaAvailability[];
  totalAvailableRooms: number;
  isCompletelyBooked: boolean;
}

export interface TimeSlotInfo {
  time: string;
  isAvailable: boolean;
  availableRooms: number;
  totalRooms: number;
}

export const availabilityApi = {
  /**
   * Vérifier la disponibilité d'un créneau (optionnellement pour une formule)
   */
  check: async (date: string, time: string, formula?: string): Promise<boolean> => {
    const { data, error } = await graphqlRequest<{
      checkAvailability: boolean;
    }>(QUERIES.CHECK_AVAILABILITY, { date, time, formula });

    if (error) return false;
    return data?.checkAvailability ?? false;
  },

  /**
   * Obtenir les détails de disponibilité d'un créneau (toutes formules)
   */
  getSlotDetails: async (date: string, time: string): Promise<ApiResponse<SlotAvailability>> => {
    const { data, error } = await graphqlRequest<{
      getSlotAvailability: SlotAvailability;
    }>(QUERIES.GET_SLOT_AVAILABILITY, { date, time });

    if (error) return createErrorState(error);
    if (!data?.getSlotAvailability) return createErrorState(ERROR_MESSAGES.unknown);

    return createSuccessState(data.getSlotAvailability);
  },

  /**
   * Obtenir tous les créneaux disponibles pour une date et formule
   */
  getTimeSlots: async (date: string, formula: string): Promise<ApiResponse<TimeSlotInfo[]>> => {
    const { data, error } = await graphqlRequest<{
      getAvailableTimeSlots: TimeSlotInfo[];
    }>(QUERIES.GET_AVAILABLE_TIME_SLOTS, { date, formula });

    if (error) return createErrorState(error);
    if (!data?.getAvailableTimeSlots) return createErrorState(ERROR_MESSAGES.unknown);

    return createSuccessState(data.getAvailableTimeSlots);
  },
};
