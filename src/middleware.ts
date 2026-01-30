import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/movie/(.*)",
  "/catalogue",
  "/login(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/unauthorized",
  "/forbidden",
  "/api/graphql", // GraphQL endpoint (l'authentification est gérée dans le context)
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Routes publiques - pas de protection
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Toutes les autres routes nécessitent une authentification
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Routes admin - vérifier le rôle
  if (isAdminRoute(req)) {
    // Vérifier le rôle admin via les metadata Clerk ou la base de données
    // Note: Le rôle est stocké dans notre DB, on laisse passer et on vérifie côté GraphQL
    // Pour une protection complète, vous pouvez configurer les publicMetadata dans Clerk
    const userRole = (sessionClaims?.metadata as { role?: string })?.role;
    
    // Si vous avez configuré le rôle dans Clerk, décommentez ceci:
    // if (userRole !== 'admin') {
    //   return NextResponse.redirect(new URL('/forbidden', req.url));
    // }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
