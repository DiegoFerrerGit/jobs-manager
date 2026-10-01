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

  let cols = await db.query.trackerColumns.findMany({
    where: eq(trackerColumns.userId, userId),
    orderBy: (c: any, { asc }: any) => [asc(c.orderIndex)],
  });

  const defaultCols = [
    { id: "people", title: "People / Screening", badge: "bg-[#9f6b53] text-white", wrapperBg: "bg-[#291d17]", cardBg: "bg-[#3f2c21]", cardHover: "hover:bg-[#4c3629]" },
    { id: "hiring", title: "Hiring Manager", badge: "bg-[#c14c8a] text-white", wrapperBg: "bg-[#281b21]", cardBg: "bg-[#402232]", cardHover: "hover:bg-[#4c293c]" },
    { id: "tecnica", title: "Técnica", badge: "bg-[#9065b0] text-white", wrapperBg: "bg-[#231f2b]", cardBg: "bg-[#322a3d]", cardHover: "hover:bg-[#3c3349]" },
    { id: "clevel", title: "C-Level / Culture", badge: "bg-[#cb912f] text-white", wrapperBg: "bg-[#2b2718]", cardBg: "bg-[#3d3822]", cardHover: "hover:bg-[#494328]" },
    { id: "oferta", title: "Oferta", badge: "bg-[#337ea9] text-white", wrapperBg: "bg-[#1c242c]", cardBg: "bg-[#263645]", cardHover: "hover:bg-[#2d4052]" },
    { id: "hold", title: "Hold", badge: "bg-[#787774] text-white", wrapperBg: "bg-[#202020]", cardBg: "bg-[#2f2f2f]", cardHover: "hover:bg-[#383838]" },
  ];

  if (cols.length === 0) {
    for (let i = 0; i < defaultCols.length; i++) {
      const col = defaultCols[i];
      const payload = { ...col, userId, orderIndex: i };
      await db.insert(trackerColumns).values(payload);
      cols.push(payload as any);
    }
  }

  const jobs = await db.query.trackerJobs.findMany({
    where: eq(trackerJobs.userId, userId),
  });

  const configRow = await db.query.trackerConfig.findFirst({
    where: eq(trackerConfig.userId, userId),
  });

  const columnsRecord: Record<string, any> = {};
  
  // Initialize columns
  for (const col of cols) {
    let { badge, wrapperBg, cardBg, cardHover } = col;
    const validBadges = [
      "bg-[#787774] text-white", "bg-[#9f6b53] text-white", "bg-[#d9730d] text-white",
      "bg-[#cb912f] text-white", "bg-[#448361] text-white", "bg-[#337ea9] text-white",
      "bg-[#9065b0] text-white", "bg-[#c14c8a] text-white", "bg-[#d44c47] text-white",
      // Old aceptadas/rechazados fallbacks
      "bg-green-500/20 text-green-500", "bg-red-500/20 text-red-500"
    ];
    const isMissingColor = !badge || !wrapperBg || badge === "undefined" || badge === "null" || !badge.includes("bg-") || !validBadges.includes(badge);

    // Fix missing colors for existing users
    if (isMissingColor) {
      const defaultMatch = defaultCols.find(d => d.id === col.id || d.title === col.title);
      if (defaultMatch) {
        badge = defaultMatch.badge;
        wrapperBg = defaultMatch.wrapperBg;
        cardBg = defaultMatch.cardBg;
        cardHover = defaultMatch.cardHover;
        await db.update(trackerColumns).set({ badge, wrapperBg, cardBg, cardHover }).where(eq(trackerColumns.id, col.id));
      } else {
        // Fallback to gris if completely unknown
        badge = "bg-[#787774] text-white";
        wrapperBg = "bg-[#202020]";
        cardBg = "bg-[#2f2f2f]";
        cardHover = "hover:bg-[#383838]";
        await db.update(trackerColumns).set({ badge, wrapperBg, cardBg, cardHover }).where(eq(trackerColumns.id, col.id));
      }
    }

    columnsRecord[col.id] = {
      id: col.id,
      title: col.title,
      badge,
      wrapperBg,
      cardBg,
      cardHover,
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
        closedAt: job.closedAt || null,
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
    closedAt: jobData.closedAt,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(trackerJobs).set(payload).where(eq(trackerJobs.id, jobId));
  } else {
    await db.insert(trackerJobs).values({ id: jobId, ...payload });
  }
}

export async function updateJobColumnAction(jobId: string, newColumnId: string, instanciaCierre?: string) {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  
  const payload: any = { columnId: newColumnId, updatedAt: new Date() };
  if (instanciaCierre !== undefined) {
    payload.instanciaCierre = instanciaCierre;
  }
  if (newColumnId === 'col-accepted' || newColumnId === 'col-rejected') {
    payload.closedAt = new Date();
  } else {
    payload.closedAt = null;
  }
  
  await db.update(trackerJobs)
    .set(payload)
    .where(eq(trackerJobs.id, jobId));
}

export async function deleteJobAction(jobId: string) {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  await db.delete(trackerJobs).where(eq(trackerJobs.id, jobId));
}

export async function updateColumnsAction(columnsRecord: Record<string, any>, columnOrder?: string[]) {
  const user = await getCurrentUser();
  if (!user?.sub) throw new Error("Unauthorized");
  const userId = user.sub;

  const orderArray = columnOrder || Object.keys(columnsRecord);

  let orderIndex = 0;
  for (const colId of orderArray) {
    const col = columnsRecord[colId];
    if (!col) continue;

    const existing = await db.query.trackerColumns.findFirst({ where: eq(trackerColumns.id, colId) });
    const payload: any = {
      userId,
      title: col.title,
      badge: col.badge,
      wrapperBg: col.wrapperBg,
      cardBg: col.cardBg,
      cardHover: col.cardHover,
    };

    if (columnOrder) {
      payload.orderIndex = orderIndex++;
    }

    if (existing) {
      await db.update(trackerColumns).set(payload).where(eq(trackerColumns.id, colId));
    } else {
      if (!columnOrder) payload.orderIndex = existing?.orderIndex ?? orderIndex++;
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
