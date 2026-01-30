// ============================================
// GRAPHQL CONTEXT - CineRoom
// Contexte injecté dans chaque resolver
// ============================================

import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import type { PrismaClient, User } from '@prisma/client';

export interface GraphQLContext {
  prisma: PrismaClient;
  userId: string | null;
  clerkId: string | null;
  user: User | null;
  isAdmin: boolean;
}

export async function createContext(): Promise<GraphQLContext> {
  const { userId: clerkId } = await auth();
  
  let user: User | null = null;
  let isAdmin = false;

  if (clerkId) {
    // Récupérer ou créer l'utilisateur dans notre base
    user = await prisma.user.findUnique({
      where: { clerkId },
    });

    // Si l'utilisateur n'existe pas, on le crée à partir des données Clerk
    if (!user) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        user = await prisma.user.create({
          data: {
            clerkId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            role: 'user',
          },
        });
      }
    }

    isAdmin = user?.role === 'admin';
  }

  return {
    prisma,
    userId: user?.id || null,
    clerkId,
    user,
    isAdmin,
  };
}

// ============================================
// HELPERS D'AUTORISATION
// ============================================

export function requireAuth(ctx: GraphQLContext): asserts ctx is GraphQLContext & { userId: string; user: User } {
  if (!ctx.userId || !ctx.user) {
    throw new Error('Vous devez être connecté pour effectuer cette action.');
  }
}

export function requireAdmin(ctx: GraphQLContext): asserts ctx is GraphQLContext & { userId: string; user: User; isAdmin: true } {
  requireAuth(ctx);
  if (!ctx.isAdmin) {
    throw new Error('Accès réservé aux administrateurs.');
  }
}
