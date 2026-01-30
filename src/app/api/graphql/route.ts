// ============================================
// API ROUTE GRAPHQL - CineRoom
// Endpoint GraphQL avec Apollo Server
// ============================================

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { createContext, GraphQLContext } from '@/graphql/context';

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production', // GraphQL Playground en dev
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    
    // Ne pas exposer les détails d'erreur en production
    if (process.env.NODE_ENV === 'production') {
      return {
        message: error.message,
        extensions: {
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        },
      };
    }
    
    return error;
  },
});

const handler = startServerAndCreateNextHandler(server, {
  context: async () => createContext(),
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
