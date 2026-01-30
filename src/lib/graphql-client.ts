// ============================================
// CLIENT GRAPHQL - CineRoom
// Utilitaires pour les requêtes GraphQL côté client
// ============================================

const GRAPHQL_ENDPOINT = '/api/graphql';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: { code?: string };
  }>;
}

export class GraphQLError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'GraphQLError';
    this.code = code;
  }
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors?.length) {
    const error = result.errors[0];
    throw new GraphQLError(error.message, error.extensions?.code);
  }

  if (!result.data) {
    throw new GraphQLError('No data returned from GraphQL');
  }

  return result.data;
}

// ============================================
// QUERIES
// ============================================

export const QUERIES = {
  // User
  ME: `
    query Me {
      me {
        id
        clerkId
        email
        firstName
        lastName
        role
      }
    }
  `,

  // Bookings
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
          totalPrice
          status
          specialRequests
          consumables {
            id
            quantity
            consumable {
              id
              name
              price
            }
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
        totalPrice
        status
        specialRequests
        consumables {
          id
          quantity
          consumable {
            id
            name
            price
          }
        }
        user {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  `,

  // Admin
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
          specialRequests
          user {
            id
            email
            firstName
            lastName
          }
          consumables {
            id
            quantity
            consumable {
              id
              name
              price
            }
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
        bookingsByFormula {
          formula
          count
          revenue
        }
        bookingsByStatus {
          status
          count
        }
        recentBookings {
          id
          movieTitle
          moviePoster
          formula
          date
          time
          totalPrice
          status
          user {
            email
            firstName
            lastName
          }
        }
        monthlyRevenue {
          month
          revenue
          bookings
        }
      }
    }
  `,

  USERS: `
    query Users($pagination: PaginationInput) {
      users(pagination: $pagination) {
        items {
          id
          clerkId
          email
          firstName
          lastName
          role
          createdAt
        }
        total
        page
        pageSize
        totalPages
      }
    }
  `,

  // Consumables
  CONSUMABLES: `
    query Consumables($category: ConsumableCategory) {
      consumables(category: $category) {
        id
        name
        description
        price
        category
        imageUrl
        isAvailable
      }
    }
  `,

  // Availability
  CHECK_AVAILABILITY: `
    query CheckAvailability($date: String!, $time: String!) {
      checkAvailability(date: $date, time: $time)
    }
  `,
};

// ============================================
// MUTATIONS
// ============================================

export const MUTATIONS = {
  // Bookings
  CREATE_BOOKING: `
    mutation CreateBooking($input: CreateBookingInput!) {
      createBooking(input: $input) {
        id
        movieId
        movieTitle
        formula
        date
        time
        totalPrice
        status
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
        formula
        date
        time
        totalPrice
        status
        updatedAt
      }
    }
  `,

  CANCEL_BOOKING: `
    mutation CancelBooking($id: ID!) {
      cancelBooking(id: $id) {
        id
        status
      }
    }
  `,

  // Admin
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

  // Consumables (Admin)
  CREATE_CONSUMABLE: `
    mutation CreateConsumable(
      $name: String!
      $description: String
      $price: Float!
      $category: ConsumableCategory!
      $imageUrl: String
    ) {
      createConsumable(
        name: $name
        description: $description
        price: $price
        category: $category
        imageUrl: $imageUrl
      ) {
        id
        name
        price
        category
      }
    }
  `,

  UPDATE_CONSUMABLE: `
    mutation UpdateConsumable(
      $id: ID!
      $name: String
      $description: String
      $price: Float
      $category: ConsumableCategory
      $imageUrl: String
      $isAvailable: Boolean
    ) {
      updateConsumable(
        id: $id
        name: $name
        description: $description
        price: $price
        category: $category
        imageUrl: $imageUrl
        isAvailable: $isAvailable
      ) {
        id
        name
        price
        isAvailable
      }
    }
  `,

  DELETE_CONSUMABLE: `
    mutation DeleteConsumable($id: ID!) {
      deleteConsumable(id: $id)
    }
  `,

  // User sync
  SYNC_USER: `
    mutation SyncUser($clerkId: String!, $email: String!, $firstName: String, $lastName: String) {
      syncUser(clerkId: $clerkId, email: $email, firstName: $firstName, lastName: $lastName) {
        id
        role
      }
    }
  `,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const graphql = {
  // User
  async getMe() {
    return graphqlRequest<{ me: unknown }>(QUERIES.ME);
  },

  // Bookings
  async getMyBookings(filters?: Record<string, unknown>, pagination?: { page?: number; pageSize?: number }) {
    return graphqlRequest<{ myBookings: unknown }>(QUERIES.MY_BOOKINGS, { filters, pagination });
  },

  async getBooking(id: string) {
    return graphqlRequest<{ booking: unknown }>(QUERIES.BOOKING, { id });
  },

  async createBooking(input: Record<string, unknown>) {
    return graphqlRequest<{ createBooking: unknown }>(MUTATIONS.CREATE_BOOKING, { input });
  },

  async updateBooking(id: string, input: Record<string, unknown>) {
    return graphqlRequest<{ updateBooking: unknown }>(MUTATIONS.UPDATE_BOOKING, { id, input });
  },

  async cancelBooking(id: string) {
    return graphqlRequest<{ cancelBooking: unknown }>(MUTATIONS.CANCEL_BOOKING, { id });
  },

  // Admin
  async getAllBookings(filters?: Record<string, unknown>, pagination?: { page?: number; pageSize?: number }) {
    return graphqlRequest<{ allBookings: unknown }>(QUERIES.ALL_BOOKINGS, { filters, pagination });
  },

  async getDashboardStats() {
    return graphqlRequest<{ dashboardStats: unknown }>(QUERIES.DASHBOARD_STATS);
  },

  async getUsers(pagination?: { page?: number; pageSize?: number }) {
    return graphqlRequest<{ users: unknown }>(QUERIES.USERS, { pagination });
  },

  async updateBookingStatus(id: string, status: string) {
    return graphqlRequest<{ updateBookingStatus: unknown }>(MUTATIONS.UPDATE_BOOKING_STATUS, { id, status });
  },

  async deleteBooking(id: string) {
    return graphqlRequest<{ deleteBooking: boolean }>(MUTATIONS.DELETE_BOOKING, { id });
  },

  async updateUserRole(userId: string, role: string) {
    return graphqlRequest<{ updateUserRole: unknown }>(MUTATIONS.UPDATE_USER_ROLE, { userId, role });
  },

  // Consumables
  async getConsumables(category?: string) {
    return graphqlRequest<{ consumables: unknown[] }>(QUERIES.CONSUMABLES, { category });
  },

  async checkAvailability(date: string, time: string) {
    return graphqlRequest<{ checkAvailability: boolean }>(QUERIES.CHECK_AVAILABILITY, { date, time });
  },
};
