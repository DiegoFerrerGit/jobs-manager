import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/auth";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cierra sesión
 *     description: Invalida la sesión en la base de datos y elimina las cookies HttpOnly (access_token y refresh_token).
 *     tags:
 *       - Autenticación
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       400:
 *         description: Error al procesar el cierre de sesión
 */
export async function POST(req: NextRequest) {
  const rawRefreshToken = req.cookies.get("refresh_token")?.value;
  
  if (rawRefreshToken) {
    // Delete session from DB
    const hashed = await hashToken(rawRefreshToken);
    await db.delete(sessions).where(eq(sessions.refreshTokenHash, hashed)).execute();
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
