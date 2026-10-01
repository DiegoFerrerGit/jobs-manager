import { db } from "./src/db/index";
import { trackerColumns } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const cols = await db.query.trackerColumns.findMany();
  console.log("Current cols:", cols);
  
  const defaultCols = [
    { id: "people", title: "People / Screening", badge: "bg-[#9f6b53] text-white", wrapperBg: "bg-[#291d17]", cardBg: "bg-[#3f2c21]", cardHover: "hover:bg-[#4c3629]" },
    { id: "hiring", title: "Hiring Manager", badge: "bg-[#c14c8a] text-white", wrapperBg: "bg-[#281b21]", cardBg: "bg-[#402232]", cardHover: "hover:bg-[#4c293c]" },
    { id: "tecnica", title: "Técnica", badge: "bg-[#9065b0] text-white", wrapperBg: "bg-[#231f2b]", cardBg: "bg-[#322a3d]", cardHover: "hover:bg-[#3c3349]" },
    { id: "clevel", title: "C-Level / Culture", badge: "bg-[#cb912f] text-white", wrapperBg: "bg-[#2b2718]", cardBg: "bg-[#3d3822]", cardHover: "hover:bg-[#494328]" },
    { id: "oferta", title: "Oferta", badge: "bg-[#337ea9] text-white", wrapperBg: "bg-[#1c242c]", cardBg: "bg-[#263645]", cardHover: "hover:bg-[#2d4052]" },
    { id: "hold", title: "Hold", badge: "bg-[#787774] text-white", wrapperBg: "bg-[#202020]", cardBg: "bg-[#2f2f2f]", cardHover: "hover:bg-[#383838]" },
  ];

  for (const col of cols) {
    const match = defaultCols.find(d => d.id === col.id || d.title === col.title);
    if (match) {
      console.log(`Updating ${col.title} with colors from ${match.id}`);
      await db.update(trackerColumns)
        .set({
          badge: match.badge,
          wrapperBg: match.wrapperBg,
          cardBg: match.cardBg,
          cardHover: match.cardHover
        })
        .where(eq(trackerColumns.id, col.id));
    }
  }
  console.log("Updated!");
  process.exit(0);
}
run().catch(console.error);
