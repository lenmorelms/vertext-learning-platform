import { clerkMiddleware } from "@clerk/nextjs/server";

// Browsing is public. Features add their private path prefixes here, and also
// call `auth.protect()` in the page or route that reads the protected data.
const protectedPrefixes = ["/my-learning"];

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isProtected) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
