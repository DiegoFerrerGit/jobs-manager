import { SignJWT, jwtVerify } from "jose";

// Secrets
const accessSecretKey = process.env.JWT_ACCESS_SECRET || "fallback_access_secret";
const accessKey = new TextEncoder().encode(accessSecretKey);

// TTLs
const accessTtlMin = parseInt(process.env.ACCESS_TOKEN_TTL_MIN || "15", 10);

export async function signAccessToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${accessTtlMin}m`)
    .sign(accessKey);
}

export async function verifyAccessToken(input: string) {
  try {
    const { payload } = await jwtVerify(input, accessKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
