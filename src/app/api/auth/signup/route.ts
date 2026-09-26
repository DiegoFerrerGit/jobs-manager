import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { allowlist } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Agrega un email al allowlist (Solo Beta)
 *     description: Permite registrar un correo en la tabla allowlist utilizando un secreto de beta (BETA_SIGNUP_SECRET).
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: El correo a habilitar
 *               secret:
 *                 type: string
 *                 description: Secreto global de registro
 *             required:
 *               - email
 *               - secret
 *     responses:
 *       200:
 *         description: Email agregado correctamente
 *       401:
 *         description: Secreto inválido
 *       400:
 *         description: El email ya existe o error en los datos
 */
export async function POST(req: Request) {
  try {
    const { email, signup_secret } = await req.json();

    if (!email || !signup_secret) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const expectedSecret = process.env.BETA_SIGNUP_SECRET;
    if (!expectedSecret || signup_secret !== expectedSecret) {
      return NextResponse.json({ error: "Secret inválido" }, { status: 403 });
    }

    // Check if already in allowlist
    const existing = await db
      .select()
      .from(allowlist)
      .where(eq(allowlist.email, email))
      .execute();

    if (existing.length > 0) {
      return NextResponse.json({ success: true, message: "Ya estabas en la lista." });
    }

    await db.insert(allowlist).values({ email }).execute();

    return NextResponse.json({ success: true, message: "Añadido a la allowlist." });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
