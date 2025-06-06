// apps/web/src/middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

const publicRoutes = createRouteMatcher([
  "/auth(.*)",     // La alle under /auth være offentlige
  "/favicon.ico",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (!publicRoutes(req)) {
    await auth.protect(); // Kaster redirect til /auth/sign-in om ikke autentisert
  }
});

export const config = {
  matcher: [
    "/((?!_next/|favicon\\.ico).*)"
  ],
};
