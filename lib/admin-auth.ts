/**
 * Admin authentication, Next.js side.
 *
 * Two environment variables, neither `NEXT_PUBLIC_`:
 *
 * - `ADMIN_PASSCODE` — what the admin types. The only thing a person knows.
 * - `ADMIN_SECRET`   — a machine secret, 32+ random characters, set identically
 *                      here and in the Convex dashboard. It signs the session
 *                      cookie and authorises every Convex write.
 *
 * The shape this depends on: the browser never talks to Convex. Server actions
 * hold `ADMIN_SECRET`, check the session cookie, and only then call the guarded
 * mutations in `convex/admin.ts`. So the secret is never in a bundle, never in
 * a response body, and never in a request the client can read or replay.
 *
 * Everything here uses Web Crypto rather than `node:crypto`, because
 * `proxy.ts` runs on the edge runtime and verifies the same cookie.
 */

export const ADMIN_COOKIE = "udk_admin";

/** A working day plus a margin. Long enough not to nag, short enough to expire. */
const SESSION_SECONDS = 12 * 60 * 60;

function secret(): string {
  const value = process.env.ADMIN_SECRET;
  if (!value || value.length < 24) {
    // Fail closed: an unconfigured deployment admits nobody.
    throw new Error("ADMIN_SECRET is missing or too short (need 32+ characters).");
  }
  return value;
}

const encoder = new TextEncoder();

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time comparison. `===` on a secret leaks its prefix through timing;
 * this compares every character regardless of where the first mismatch is.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkPasscode(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected || expected.length < 8) {
    throw new Error("ADMIN_PASSCODE is missing or too short (need 12+ characters).");
  }
  return constantTimeEqual(input, expected);
}

/** `<expiry>.<hmac>` — the passcode itself never goes into the cookie. */
export async function createSessionToken(now = Date.now()): Promise<string> {
  const expiry = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${expiry}.${await hmac(expiry)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  now = Date.now(),
): Promise<boolean> {
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;
  if (!constantTimeEqual(signature, await hmac(expiry))) return false;
  return Number(expiry) > Math.floor(now / 1000);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
} as const;

/**
 * The secret handed to Convex. Server-only by construction: calling this from a
 * client component would throw, and `process.env.ADMIN_SECRET` is not inlined
 * into any bundle because it carries no `NEXT_PUBLIC_` prefix.
 */
export function adminSecret(): string {
  return secret();
}

/* ---------------------------------------------------------------------------
   Rate limiting.

   Without this the login action is an unlimited-guess oracle in front of a
   human-chosen passcode, which is the failure mode that makes shared-secret
   auth indefensible.

   In-memory, so it is per-instance and resets on deploy. On a single instance
   that is the real thing; across several it multiplies the allowance by the
   instance count. If the admin surface ever matters more than it does today,
   this belongs in a Convex table where it is shared. Noted in DECISIONS.md.
--------------------------------------------------------------------------- */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Bucket = { count: number; firstAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, now = Date.now()): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.firstAt > WINDOW_MS) {
    buckets.set(key, { count: 1, firstAt: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count++;
  if (bucket.count > MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.firstAt + WINDOW_MS - now) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Called on a successful sign-in so a correct passcode clears the count. */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}
