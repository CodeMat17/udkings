/**
 * The admin guard.
 *
 * Convex functions are public HTTP endpoints — the deployment URL is
 * discoverable, so a gate on the `/admin` route in `proxy.ts` protects the
 * page and nothing else. Every mutation that changes the catalogue calls
 * `requireAdmin` first, and that is the wall.
 *
 * The secret lives in a Convex environment variable (`ADMIN_SECRET`, set in the
 * Convex dashboard) and is supplied by Next.js server actions, which hold their
 * own copy server-side. It never reaches a browser: no component imports it, no
 * client component receives it as a prop, and it is not `NEXT_PUBLIC_`.
 *
 * See DECISIONS.md for why this is a shared secret and not a user identity, and
 * what that costs.
 */

/**
 * Constant-time string comparison. Convex runs a V8 isolate, not Node, so
 * `crypto.timingSafeEqual` is unavailable — this is the same idea by hand.
 * Length is compared first and leaks only the length, which is not the secret.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function requireAdmin(secret: string): void {
  const expected = process.env.ADMIN_SECRET;

  if (!expected) {
    // Fail closed. A deployment without the variable set admits nobody.
    throw new Error("ADMIN_SECRET is not configured on this deployment.");
  }
  if (expected.length < 24) {
    throw new Error("ADMIN_SECRET is too short to be a secret. Use 32+ characters.");
  }
  if (!constantTimeEqual(secret, expected)) {
    throw new Error("Not authorised.");
  }
}
