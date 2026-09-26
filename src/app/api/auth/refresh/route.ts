import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiration } from "@/lib/auth";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresca el token de acceso
 *     description: Utiliza el refresh_token de la cookie para generar un nuevo access_token y renovar la sesión.
 *     tags:
 *       - Autenticación
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token refrescado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Error al refrescar el token
 */
export async function POST(req: NextRequest) {
  try {
    const rawRefreshToken = req.cookies.get("refresh_token")?.value;

    if (!rawRefreshToken) {
      return NextResponse.json({ success: false, error: "No refresh token" }, { status: 200 });
    }

    const hashedToken = await hashToken(rawRefreshToken);

    // Encontrar sesión válida
    const session = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshTokenHash, hashedToken),
          gt(sessions.expiresAt, new Date())
        )
      )
      .execute()
      .then((res: any[]) => res[0]);

    if (!session) {
      return NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 200 });
    }

    // Encontrar usuario
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .execute()
      .then((res: any[]) => res[0]);

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 200 });
    }

    // Rotar Refresh Token
    const newRefreshToken = generateRefreshToken();
    const newExpires = getRefreshTokenExpiration();

    await db.update(sessions).set({
      refreshTokenHash: await hashToken(newRefreshToken),
      expiresAt: newExpires
    }).where(eq(sessions.id, session.id)).execute();

    // Nuevo Access Token
    const accessToken = await signAccessToken({ sub: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({ success: true, user: { email: user.email, name: user.name } });
    
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
      value: newRefreshToken,
      httpOnly: true,
      secure: isSecure,
      sameSite,
      maxAge: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "30", 10) * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
