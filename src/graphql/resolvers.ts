// ============================================
// GRAPHQL RESOLVERS - CineRoom
// Implémentation des queries et mutations
// ============================================

import { GraphQLContext, requireAuth, requireAdmin } from './context';
import { FORMULAS, CONSUMABLES } from '@/types';

// Helper pour calculer le prix total
function calculateTotalPrice(
  formula: string,
  consumables?: { consumableId: string; quantity: number }[]
): number {
  const formulaConfig = FORMULAS.find(f => f.id === formula);
  const basePrice = formulaConfig?.basePrice || 0;

  const consumablesPrice = consumables?.reduce((total, item) => {
    const consumable = CONSUMABLES.find(c => c.id === item.consumableId);
    return total + (consumable?.price || 0) * item.quantity;
  }, 0) || 0;

  return basePrice + consumablesPrice;
}

// Helper pour formater les dates
function formatDate(date: Date): string {
  return date.toISOString();
}

export const resolvers = {
  // ============================================
  // QUERIES
  // ============================================
  Query: {
    // ---- User Queries ----
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.userId) return null;
      return ctx.user;
    },

    user: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAdmin(ctx);
      return ctx.prisma.user.findUnique({ where: { id } });
    },

    users: async (
      _: unknown,
      { pagination }: { pagination?: { page?: number; pageSize?: number } },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);
      
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const skip = (page - 1) * pageSize;

      const [items, total] = await Promise.all([
        ctx.prisma.user.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.user.count(),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },

    // ---- Booking Queries (Utilisateur) ----
    myBookings: async (
      _: unknown,
      { filters, pagination }: { 
        filters?: { status?: string; dateFrom?: string; dateTo?: string };
        pagination?: { page?: number; pageSize?: number };
      },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 10;
      const skip = (page - 1) * pageSize;

      const where: Record<string, unknown> = { userId: ctx.userId };
      
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.dateFrom || filters?.dateTo) {
        where.date = {};
        if (filters.dateFrom) (where.date as Record<string, string>).gte = filters.dateFrom;
        if (filters.dateTo) (where.date as Record<string, string>).lte = filters.dateTo;
      }

      const [items, total] = await Promise.all([
        ctx.prisma.booking.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { date: 'desc' },
          include: {
            consumables: {
              include: { consumable: true },
            },
            user: true,
          },
        }),
        ctx.prisma.booking.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },

    booking: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);

      const booking = await ctx.prisma.booking.findUnique({
        where: { id },
        include: {
          consumables: {
            include: { consumable: true },
          },
          user: true,
        },
      });

      if (!booking) {
        throw new Error('Réservation introuvable.');
      }

      // Vérifier que l'utilisateur a accès à cette réservation
      if (booking.userId !== ctx.userId && !ctx.isAdmin) {
        throw new Error('Vous n\'avez pas accès à cette réservation.');
      }

      return booking;
    },

    // ---- Booking Queries (Admin) ----
    allBookings: async (
      _: unknown,
      { filters, pagination }: { 
        filters?: { status?: string; movieId?: number; dateFrom?: string; dateTo?: string; formula?: string; userId?: string };
        pagination?: { page?: number; pageSize?: number };
      },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);

      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const skip = (page - 1) * pageSize;

      const where: Record<string, unknown> = {};
      
      if (filters?.status) where.status = filters.status;
      if (filters?.movieId) where.movieId = filters.movieId;
      if (filters?.formula) where.formula = filters.formula;
      if (filters?.userId) where.userId = filters.userId;
      if (filters?.dateFrom || filters?.dateTo) {
        where.date = {};
        if (filters.dateFrom) (where.date as Record<string, string>).gte = filters.dateFrom;
        if (filters.dateTo) (where.date as Record<string, string>).lte = filters.dateTo;
      }

      const [items, total] = await Promise.all([
        ctx.prisma.booking.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            consumables: {
              include: { consumable: true },
            },
            user: true,
          },
        }),
        ctx.prisma.booking.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },

    // ---- Dashboard Stats (Admin) ----
    dashboardStats: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAdmin(ctx);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalBookings,
        activeBookings,
        totalRevenue,
        totalUsers,
        bookingsByFormula,
        bookingsByStatus,
        recentBookings,
      ] = await Promise.all([
        ctx.prisma.booking.count(),
        ctx.prisma.booking.count({ where: { status: 'active' } }),
        ctx.prisma.booking.aggregate({
          _sum: { totalPrice: true },
          where: { status: { not: 'annulee' } },
        }),
        ctx.prisma.user.count(),
        ctx.prisma.booking.groupBy({
          by: ['formula'],
          _count: true,
          _sum: { totalPrice: true },
        }),
        ctx.prisma.booking.groupBy({
          by: ['status'],
          _count: true,
        }),
        ctx.prisma.booking.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            consumables: { include: { consumable: true } },
            user: true,
          },
        }),
      ]);

      // Calculer les revenus mensuels (6 derniers mois)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthData = await ctx.prisma.booking.aggregate({
          _sum: { totalPrice: true },
          _count: true,
          where: {
            status: { not: 'annulee' },
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        monthlyRevenue.push({
          month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          revenue: monthData._sum.totalPrice || 0,
          bookings: monthData._count || 0,
        });
      }

      return {
        totalBookings,
        activeBookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        totalUsers,
        bookingsByFormula: bookingsByFormula.map(b => ({
          formula: b.formula,
          count: b._count,
          revenue: b._sum.totalPrice || 0,
        })),
        bookingsByStatus: bookingsByStatus.map(b => ({
          status: b.status,
          count: b._count,
        })),
        recentBookings,
        monthlyRevenue,
      };
    },

    // ---- Consumables ----
    consumables: async (
      _: unknown,
      { category }: { category?: string },
      ctx: GraphQLContext
    ) => {
      const where: Record<string, unknown> = { isAvailable: true };
      if (category) where.category = category;
      
      return ctx.prisma.consumable.findMany({ where });
    },

    consumable: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      return ctx.prisma.consumable.findUnique({ where: { id } });
    },

    // ---- Availability Check ----
    checkAvailability: async (
      _: unknown,
      { date, time }: { date: string; time: string },
      ctx: GraphQLContext
    ) => {
      // Compter les réservations pour ce créneau
      const bookingsCount = await ctx.prisma.booking.count({
        where: {
          date,
          time,
          status: { in: ['active', 'modifiee'] },
        },
      });

      // Limiter à 5 salles par créneau (configurable)
      const MAX_ROOMS = 5;
      return bookingsCount < MAX_ROOMS;
    },
  },

  // ============================================
  // MUTATIONS
  // ============================================
  Mutation: {
    // ---- Booking Mutations (Utilisateur) ----
    createBooking: async (
      _: unknown,
      { input }: { 
        input: {
          movieId: number;
          movieTitle: string;
          moviePoster?: string;
          formula: string;
          date: string;
          time: string;
          consumables?: { consumableId: string; quantity: number }[];
          specialRequests?: string;
        };
      },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);

      // Vérifier la disponibilité
      const isAvailable = await resolvers.Query.checkAvailability(
        null,
        { date: input.date, time: input.time },
        ctx
      );

      if (!isAvailable) {
        throw new Error('Ce créneau n\'est plus disponible.');
      }

      // Calculer le prix total
      const totalPrice = calculateTotalPrice(input.formula, input.consumables);

      // Créer la réservation
      const booking = await ctx.prisma.booking.create({
        data: {
          userId: ctx.userId,
          movieId: input.movieId,
          movieTitle: input.movieTitle,
          moviePoster: input.moviePoster,
          formula: input.formula,
          date: input.date,
          time: input.time,
          totalPrice,
          specialRequests: input.specialRequests,
          status: 'active',
          consumables: input.consumables ? {
            create: input.consumables.map(c => ({
              consumableId: c.consumableId,
              quantity: c.quantity,
            })),
          } : undefined,
        },
        include: {
          consumables: { include: { consumable: true } },
          user: true,
        },
      });

      return booking;
    },

    updateBooking: async (
      _: unknown,
      { id, input }: { 
        id: string;
        input: {
          date?: string;
          time?: string;
          formula?: string;
          consumables?: { consumableId: string; quantity: number }[];
          specialRequests?: string;
          status?: string;
        };
      },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);

      // Vérifier que la réservation appartient à l'utilisateur
      const existing = await ctx.prisma.booking.findUnique({ where: { id } });
      
      if (!existing) {
        throw new Error('Réservation introuvable.');
      }
      
      if (existing.userId !== ctx.userId && !ctx.isAdmin) {
        throw new Error('Vous n\'avez pas accès à cette réservation.');
      }

      if (existing.status === 'annulee' || existing.status === 'passee') {
        throw new Error('Cette réservation ne peut plus être modifiée.');
      }

      // Recalculer le prix si la formule ou les consommables changent
      const newFormula = input.formula || existing.formula;
      let totalPrice = existing.totalPrice;
      
      if (input.formula || input.consumables) {
        totalPrice = calculateTotalPrice(newFormula, input.consumables);
      }

      // Si on change la date/heure, vérifier la disponibilité
      if (input.date || input.time) {
        const newDate = input.date || existing.date;
        const newTime = input.time || existing.time;
        
        const bookingsCount = await ctx.prisma.booking.count({
          where: {
            date: newDate,
            time: newTime,
            status: { in: ['active', 'modifiee'] },
            id: { not: id }, // Exclure la réservation actuelle
          },
        });

        if (bookingsCount >= 5) {
          throw new Error('Ce créneau n\'est plus disponible.');
        }
      }

      // Supprimer les anciens consommables si on en met de nouveaux
      if (input.consumables) {
        await ctx.prisma.bookingConsumable.deleteMany({
          where: { bookingId: id },
        });
      }

      // Mettre à jour la réservation
      const booking = await ctx.prisma.booking.update({
        where: { id },
        data: {
          date: input.date,
          time: input.time,
          formula: input.formula,
          specialRequests: input.specialRequests,
          status: input.status || (input.date || input.time || input.formula ? 'modifiee' : undefined),
          totalPrice,
          consumables: input.consumables ? {
            create: input.consumables.map(c => ({
              consumableId: c.consumableId,
              quantity: c.quantity,
            })),
          } : undefined,
        },
        include: {
          consumables: { include: { consumable: true } },
          user: true,
        },
      });

      return booking;
    },

    cancelBooking: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext
    ) => {
      requireAuth(ctx);

      const existing = await ctx.prisma.booking.findUnique({ where: { id } });
      
      if (!existing) {
        throw new Error('Réservation introuvable.');
      }
      
      if (existing.userId !== ctx.userId && !ctx.isAdmin) {
        throw new Error('Vous n\'avez pas accès à cette réservation.');
      }

      if (existing.status === 'annulee') {
        throw new Error('Cette réservation est déjà annulée.');
      }

      if (existing.status === 'passee') {
        throw new Error('Une réservation passée ne peut pas être annulée.');
      }

      const booking = await ctx.prisma.booking.update({
        where: { id },
        data: { status: 'annulee' },
        include: {
          consumables: { include: { consumable: true } },
          user: true,
        },
      });

      return booking;
    },

    // ---- Admin Mutations ----
    updateBookingStatus: async (
      _: unknown,
      { id, status }: { id: string; status: string },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);

      const booking = await ctx.prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          consumables: { include: { consumable: true } },
          user: true,
        },
      });

      return booking;
    },

    deleteBooking: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);

      await ctx.prisma.booking.delete({ where: { id } });
      return true;
    },

    updateUserRole: async (
      _: unknown,
      { userId, role }: { userId: string; role: string },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);

      const user = await ctx.prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      return user;
    },

    // ---- Consumable Mutations (Admin) ----
    createConsumable: async (
      _: unknown,
      args: { name: string; description?: string; price: number; category: string; imageUrl?: string },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);

      return ctx.prisma.consumable.create({
        data: {
          name: args.name,
          description: args.description,
          price: args.price,
          category: args.category,
          imageUrl: args.imageUrl,
          isAvailable: true,
        },
      });
    },

    updateConsumable: async (
      _: unknown,
      args: { id: string; name?: string; description?: string; price?: number; category?: string; imageUrl?: string; isAvailable?: boolean },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);

      return ctx.prisma.consumable.update({
        where: { id: args.id },
        data: {
          name: args.name,
          description: args.description,
          price: args.price,
          category: args.category,
          imageUrl: args.imageUrl,
          isAvailable: args.isAvailable,
        },
      });
    },

    deleteConsumable: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext
    ) => {
      requireAdmin(ctx);

      await ctx.prisma.consumable.delete({ where: { id } });
      return true;
    },

    // ---- User Sync from Clerk ----
    syncUser: async (
      _: unknown,
      { clerkId, email, firstName, lastName }: { clerkId: string; email: string; firstName?: string; lastName?: string },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.user.upsert({
        where: { clerkId },
        update: { email, firstName, lastName },
        create: { clerkId, email, firstName, lastName, role: 'user' },
      });
    },
  },

  // ============================================
  // TYPE RESOLVERS
  // ============================================
  User: {
    bookings: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.booking.findMany({
        where: { userId: parent.id },
        include: {
          consumables: { include: { consumable: true } },
        },
      });
    },
    createdAt: (parent: { createdAt: Date }) => formatDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date }) => formatDate(parent.updatedAt),
  },

  Booking: {
    user: async (parent: { userId: string }, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.user.findUnique({ where: { id: parent.userId } });
    },
    consumables: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.bookingConsumable.findMany({
        where: { bookingId: parent.id },
        include: { consumable: true },
      });
    },
    createdAt: (parent: { createdAt: Date }) => formatDate(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date }) => formatDate(parent.updatedAt),
  },

  BookingConsumable: {
    consumable: async (parent: { consumableId: string }, _: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.consumable.findUnique({ where: { id: parent.consumableId } });
    },
  },
};
