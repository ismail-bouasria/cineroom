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
  "/api/(.*)", // Toutes les API sont publiques (auth gérée dans les resolvers)
]);

export default clerkMiddleware(async (auth, req) => {
  // Routes publiques - pas de protection
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protéger les autres routes
  await auth.protect();
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
