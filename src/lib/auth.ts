import { type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { signAccessToken, verifyAccessToken } from "./jwt";

export { signAccessToken, verifyAccessToken };

// TTLs
const refreshTtlDays = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "30", 10);

// Generar token seguro usando Web Crypto API (Edge compatible)
export function generateRefreshToken(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Hashear token usando Web Crypto API (Edge compatible)
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function getRefreshTokenExpiration(): Date {
  const date = new Date();
  date.setDate(date.getDate() + refreshTtlDays);
  return date;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  
  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  const { db } = await import("@/db");
  const { users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const user = await db
    .select({ publicId: users.publicId, picture: users.picture, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, Number(payload.sub)))
    .limit(1)
    .then((res: any[]) => res[0]);
    
  if (!user) return null;

  return {
    ...payload,
    publicId: user.publicId,
    picture: user.picture,
    name: user.name || payload.name,
    email: user.email || payload.email,
  } as JWTPayload & { sub: number, email: string, name: string, publicId: string, picture?: string };
}
