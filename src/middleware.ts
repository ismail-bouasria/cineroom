import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// On definit la landing page comme page publique
const isPublicRoute = createRouteMatcher(["/"]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect(); // redirige automatiquement vers la page de connexion si non authentifié
  }
});

export const config = {
  matcher: [
    // Ignore les fichiers statiques et les API routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Toujours exécuter pour les API
    "/(api|trpc)(.*)",
  ],
};
