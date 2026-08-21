import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

/**
 * Next 16 renamed middleware to proxy. Security headers live here, plus the
 * per-request CSP nonce, plus the admin route gate.
 *
 * The gate is worth being precise about: it stops someone *loading* an admin
 * page without a session. It is not what protects the data. Convex functions
 * are public HTTP endpoints, so the real wall is `requireAdmin` inside every
 * mutation in `convex/admin.ts`, plus the session check in every server
 * action. This is one layer of three, and the least important of them.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await verifySessionToken(token))) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const nonce = crypto.randomUUID().replace(/-/g, "");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://res.cloudinary.com`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers } });

  // Report-only first, per §14.3 — flip to Content-Security-Policy once the
  // report endpoint is quiet on every route.
  response.headers.set("Content-Security-Policy-Report-Only", csp);
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and image optimisation.
    "/((?!_next/static|_next/image|favicon.ico|catalogue|.*\.svg$|.*\.png$).*)",
  ],
};
