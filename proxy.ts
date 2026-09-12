import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

/**
 * The admin route gate — and nothing else.
 *
 * The matcher keeps this off every public route, so a visitor browsing the
 * catalogue never invokes a function here. Security headers moved to
 * `next.config.ts`, where the CDN serves them with the static files.
 *
 * This stops someone *loading* an admin page without a session. It is not what
 * protects the data: that is the session check in every server action plus
 * `requireAdmin` inside every Convex mutation.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  if (await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
