import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { signAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiration } from "@/lib/auth";
import { db } from "@/db";
import { users, sessions, allowlist } from "@/db/schema";
import { eq } from "drizzle-orm";

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const client = new OAuth2Client(clientId);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión con Google
 *     description: Intercambia un token JWT de Google por una sesión en el sistema y retorna cookies HttpOnly (access_token y refresh_token).
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Token JWT provisto por Google Identity Services
 *             required:
 *               - credential
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Credenciales inválidas
 *       403:
 *         description: Usuario no autorizado (no está en el allowlist)
 */
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!clientId) {
      console.error("GOOGLE_OAUTH_CLIENT_ID is not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const { email, name, picture, sub } = payload;
    if (!email) {
      return NextResponse.json({ error: "No email in token" }, { status: 400 });
    }

    // --- Enforce Allowlist ---
    const isAllowlistEnabled = process.env.ALLOWLIST_ENABLED === "true";
    if (isAllowlistEnabled) {
      const allowedUser = await db
        .select()
        .from(allowlist)
        .where(eq(allowlist.email, email))
        .execute();
      
      if (allowedUser.length === 0) {
        return NextResponse.json({ error: "Este correo no está autorizado para ingresar a la biblioteca." }, { status: 403 });
      }
    }

    // --- Upsert User ---
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute()
      .then((res: any[]) => res[0]);

    if (!user) {
      const [newUser] = await db.insert(users).values({
        email,
        name,
        picture
      }).returning().execute();
      user = newUser;
    } else {
      // Opcional: Actualizar datos
      const [updated] = await db.update(users).set({
        name,
        picture
      }).where(eq(users.id, user.id)).returning().execute();
      user = updated;
    }

    // --- Generate Tokens ---
    const accessToken = await signAccessToken({ sub: user.id, email: user.email, name: user.name, publicId: user.publicId });
    const refreshToken = generateRefreshToken();
    
    // --- Save Session ---
    await db.insert(sessions).values({
      userId: user.id,
      refreshTokenHash: await hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiration(),
    }).execute();
    
    const response = NextResponse.json({ success: true, user: { email, name, picture } });
    
    // --- Set Cookies ---
    const isSecure = process.env.COOKIE_SECURE === "true";
    const sameSite = (process.env.COOKIE_SAMESITE as any) || "lax";

    response.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true,
      secure: isSecure,
      sameSite,
      maxAge: parseInt(process.env.ACCESS_TOKEN_TTL_MIN || "15", 10) * 60,
      path: "/",
    });

    response.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: isSecure,
      sameSite,
      maxAge: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "30", 10) * 24 * 60 * 60,
      path: "/",
    });
    
    return response;
  } catch (error: any) {
    console.error("Auth Verification Error:", error?.message || error);
    console.error("Auth Error Stack:", error?.stack);
    
    // Distinguish between Google token errors and DB errors
    const message = error?.message || "";
    if (message.includes("Token used too late") || message.includes("Invalid token") || message.includes("Wrong recipient")) {
      return NextResponse.json({ error: "Token de Google inválido o expirado. Intentá de nuevo." }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Error del servidor al iniciar sesión. Revisá los logs." }, { status: 500 });
  }
}
