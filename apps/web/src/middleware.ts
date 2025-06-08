// apps/web/src/middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

const publicRoutes = createRouteMatcher([
  "/sign-in(.*)",           // Sign in pages
  "/sign-up(.*)",           // Sign up pages
  "/user-profile(.*)",      // User profile pages (Clerk needs these to be public)
  "/api/webhooks(.*)",      // Webhook endpoints
  "/api/health",            // Health check endpoint
  "/favicon.ico",
  "/",                      // Landing page if needed
  "/about",                 // About page - public access
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Don't protect public routes
  if (!publicRoutes(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
