import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/movie/(.*)",
  "/login(.*)",
  "/unauthorized",
  "/forbidden",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    // TODO: Vérifier le rôle admin via Clerk metadata
    // const { sessionClaims } = await auth();
    // if (sessionClaims?.metadata?.role !== 'admin') {
    //   return Response.redirect(new URL('/forbidden', req.url));
    // }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
