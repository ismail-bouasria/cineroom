// ============================================
// GRAPHQL SCHEMA - CineRoom
// Définition des types, queries et mutations
// ============================================

export const typeDefs = /* GraphQL */ `
  # ============================================
  # ENUMS
  # ============================================

  enum ReservationStatus {
    active
    modifiee
    annulee
    passee
  }

  enum BookingFormula {
    cine_duo
    cine_team
    cine_groupe
  }

  enum ConsumableCategory {
    popcorn
    boissons
    snacks
    menus
  }

  enum UserRole {
    user
    admin
  }

  # ============================================
  # TYPES
  # ============================================

  type User {
    id: ID!
    clerkId: String!
    email: String!
    firstName: String
    lastName: String
    role: UserRole!
    createdAt: String!
    updatedAt: String!
    bookings: [Booking!]!
  }

  type Consumable {
    id: ID!
    name: String!
    description: String
    price: Float!
    category: ConsumableCategory!
    imageUrl: String
    isAvailable: Boolean!
  }

  type BookingConsumable {
    id: ID!
    consumable: Consumable!
    quantity: Int!
  }

  type Booking {
    id: ID!
    user: User!
    movieId: Int!
    movieTitle: String!
    moviePoster: String
    formula: String!
    date: String!
    time: String!
    totalPrice: Float!
    status: ReservationStatus!
    specialRequests: String
    consumables: [BookingConsumable!]!
    createdAt: String!
    updatedAt: String!
  }

  # ============================================
  # STATISTICS (Admin)
  # ============================================

  type DashboardStats {
    totalBookings: Int!
    activeBookings: Int!
    totalRevenue: Float!
    totalUsers: Int!
    bookingsByFormula: [FormulaStats!]!
    bookingsByStatus: [StatusStats!]!
    recentBookings: [Booking!]!
    monthlyRevenue: [MonthlyRevenue!]!
  }

  type FormulaStats {
    formula: String!
    count: Int!
    revenue: Float!
  }

  type StatusStats {
    status: ReservationStatus!
    count: Int!
  }

  type MonthlyRevenue {
    month: String!
    revenue: Float!
    bookings: Int!
  }

  # ============================================
  # INPUTS
  # ============================================

  input ConsumableInput {
    consumableId: ID!
    quantity: Int!
  }

  input CreateBookingInput {
    movieId: Int!
    movieTitle: String!
    moviePoster: String
    formula: String!
    date: String!
    time: String!
    consumables: [ConsumableInput!]
    specialRequests: String
  }

  input UpdateBookingInput {
    date: String
    time: String
    formula: String
    consumables: [ConsumableInput!]
    specialRequests: String
    status: ReservationStatus
  }

  input BookingFilters {
    status: ReservationStatus
    movieId: Int
    dateFrom: String
    dateTo: String
    formula: String
    userId: ID
  }

  input PaginationInput {
    page: Int
    pageSize: Int
  }

  # ============================================
  # PAGINATED RESPONSES
  # ============================================

  type PaginatedBookings {
    items: [Booking!]!
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  type PaginatedUsers {
    items: [User!]!
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  # ============================================
  # QUERIES
  # ============================================

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(pagination: PaginationInput): PaginatedUsers!

    # Booking queries (utilisateur)
    myBookings(filters: BookingFilters, pagination: PaginationInput): PaginatedBookings!
    booking(id: ID!): Booking

    # Booking queries (admin)
    allBookings(filters: BookingFilters, pagination: PaginationInput): PaginatedBookings!
    
    # Dashboard stats (admin)
    dashboardStats: DashboardStats!

    # Consumables
    consumables(category: ConsumableCategory): [Consumable!]!
    consumable(id: ID!): Consumable

    # Availability check
    checkAvailability(date: String!, time: String!): Boolean!
  }

  # ============================================
  # MUTATIONS
  # ============================================

  type Mutation {
    # Booking mutations (utilisateur)
    createBooking(input: CreateBookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    cancelBooking(id: ID!): Booking!

    # Admin mutations
    updateBookingStatus(id: ID!, status: ReservationStatus!): Booking!
    deleteBooking(id: ID!): Boolean!
    
    # User management (admin)
    updateUserRole(userId: ID!, role: UserRole!): User!
    
    # Consumable management (admin)
    createConsumable(
      name: String!
      description: String
      price: Float!
      category: ConsumableCategory!
      imageUrl: String
    ): Consumable!
    updateConsumable(
      id: ID!
      name: String
      description: String
      price: Float
      category: ConsumableCategory
      imageUrl: String
      isAvailable: Boolean
    ): Consumable!
    deleteConsumable(id: ID!): Boolean!

    # User sync from Clerk
    syncUser(clerkId: String!, email: String!, firstName: String, lastName: String): User!
  }
`;
