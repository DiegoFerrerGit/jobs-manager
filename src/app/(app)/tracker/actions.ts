"use server";

import { db } from "@/db";
import { trackerColumns, trackerJobs, trackerConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_SELECT_OPTIONS } from "./types";

export async function getTrackerData() {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  const userId = user.sub;

  const cols = await db.query.trackerColumns.findMany({
    where: eq(trackerColumns.userId, userId),
    orderBy: (c: any, { asc }: any) => [asc(c.orderIndex)],
  });

  const jobs = await db.query.trackerJobs.findMany({
    where: eq(trackerJobs.userId, userId),
  });

  const configRow = await db.query.trackerConfig.findFirst({
    where: eq(trackerConfig.userId, userId),
  });

  const columnsRecord: Record<string, any> = {};
  
  // Initialize columns
  for (const col of cols) {
    columnsRecord[col.id] = {
      id: col.id,
      title: col.title,
      badge: col.badge,
      wrapperBg: col.wrapperBg,
      cardBg: col.cardBg,
      cardHover: col.cardHover,
      jobs: [],
    };
  }

  // Populate jobs
  for (const job of jobs) {
    if (columnsRecord[job.columnId]) {
      columnsRecord[job.columnId].jobs.push({
        id: job.id,
        name: job.name,
        role: job.role || "",
        location: job.location || "",
        salarioMensual: job.salarioMensual || 0,
        salarioAnual: job.salarioAnual || 0,
        beneficios: job.beneficios || "",
        contras: job.contras || "",
        inglesRequerido: job.inglesRequerido || "",
        handsOn: job.handsOn || "",
        idiomaPosicion: job.idiomaPosicion || "",
        tipoContratacion: job.tipoContratacion || "",
        formaPago: job.formaPago || "",
        plataforma: job.plataforma || "",
        linkPosicion: job.linkPosicion || "",
        linkEmpresa: job.linkEmpresa || "",
        contactoRecruiter: job.contactoRecruiter || "",
        contactoLeader: job.contactoLeader || "",
        jd: job.jd || "",
        linkNotion: job.linkNotion || "",
        notionId: job.notionId || "",
        instanciaCierre: job.instanciaCierre || "",
        categoriaCierre: job.categoriaCierre || "",
        motivoRechazo: job.motivoRechazo || "",
      });
    }
  }

  // Sort jobs by salary descending
  for (const colId in columnsRecord) {
    columnsRecord[colId].jobs.sort((a: any, b: any) => {
      const sA = a.salarioAnual || (a.salarioMensual * 12) || 0;
      const sB = b.salarioAnual || (b.salarioMensual * 12) || 0;
      return sB - sA;
    });
  }

  const columnOrder = cols.map((c: any) => c.id);
  const config = configRow ? { options: { ...DEFAULT_SELECT_OPTIONS, ...configRow.options } } : null;

  return { columns: columnsRecord, columnOrder, config };
}

export async function updateJobAction(jobId: string, columnId: string, jobData: any) {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  
  // Upsert job
  const existing = await db.query.trackerJobs.findFirst({ where: eq(trackerJobs.id, jobId) });
  
  const payload = {
    userId: user.sub,
    columnId,
    name: jobData.name || "Nuevo proceso",
    role: jobData.role,
    location: jobData.location,
    salarioMensual: jobData.salarioMensual,
    salarioAnual: jobData.salarioAnual,
    beneficios: jobData.beneficios,
    contras: jobData.contras,
    inglesRequerido: jobData.inglesRequerido,
    handsOn: jobData.handsOn,
    idiomaPosicion: jobData.idiomaPosicion,
    tipoContratacion: jobData.tipoContratacion,
    formaPago: jobData.formaPago,
    plataforma: jobData.plataforma,
    linkPosicion: jobData.linkPosicion,
    linkEmpresa: jobData.linkEmpresa,
    contactoRecruiter: jobData.contactoRecruiter,
    contactoLeader: jobData.contactoLeader,
    jd: jobData.jd,
    linkNotion: jobData.linkNotion,
    notionId: jobData.notionId,
    instanciaCierre: jobData.instanciaCierre,
    categoriaCierre: jobData.categoriaCierre,
    motivoRechazo: jobData.motivoRechazo,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(trackerJobs).set(payload).where(eq(trackerJobs.id, jobId));
  } else {
    await db.insert(trackerJobs).values({ id: jobId, ...payload });
  }
}

export async function updateJobColumnAction(jobId: string, newColumnId: string) {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  await db.update(trackerJobs)
    .set({ columnId: newColumnId, updatedAt: new Date() })
    .where(eq(trackerJobs.id, jobId));
}

export async function deleteJobAction(jobId: string) {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  await db.delete(trackerJobs).where(eq(trackerJobs.id, jobId));
}

export async function updateColumnsAction(columnsRecord: Record<string, any>) {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  const userId = user.sub;

  let orderIndex = 0;
  for (const colId in columnsRecord) {
    const col = columnsRecord[colId];
    const existing = await db.query.trackerColumns.findFirst({ where: eq(trackerColumns.id, colId) });
    const payload = {
      userId,
      title: col.title,
      badge: col.badge,
      wrapperBg: col.wrapperBg,
      cardBg: col.cardBg,
      cardHover: col.cardHover,
      orderIndex: orderIndex++,
    };
    if (existing) {
      await db.update(trackerColumns).set(payload).where(eq(trackerColumns.id, colId));
    } else {
      await db.insert(trackerColumns).values({ id: colId, ...payload });
    }
  }
}

export async function updateConfigAction(options: any) {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  const userId = user.sub;

  const existing = await db.query.trackerConfig.findFirst({ where: eq(trackerConfig.userId, userId) });
  if (existing) {
    await db.update(trackerConfig).set({ options }).where(eq(trackerConfig.id, existing.id));
  } else {
    await db.insert(trackerConfig).values({ userId, options });
  }
}
