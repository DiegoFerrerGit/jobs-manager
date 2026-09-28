import fs from 'fs';

const filePath = 'src/app/(app)/tracker/TrackerClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'className={`\\${isFinalized ? "shrink-0 w-[300px]" : "mb-3"} rounded-xl p-3 shadow-sm cursor-pointer group relative transition-colors flex flex-col gap-3 \\${column.cardBg} \\${column.cardHover} border border-white/5 \\${snapshotJob?.isDragging ? "ring-2 ring-primary shadow-lg" : ""} \\${selectedJobId === job.id ? "ring-2 ring-inset ring-blue-500 bg-white/5" : ""}`}',
  'className={`\\${isFinalized ? "w-full sm:w-[280px]" : "mb-3"} rounded-xl p-3 shadow-sm cursor-pointer group relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-3 \\${column.cardBg} \\${column.cardHover} border border-white/5 \\${snapshotJob?.isDragging ? "ring-2 ring-primary shadow-lg" : ""} \\${selectedJobId === job.id ? "ring-2 ring-inset ring-blue-500 bg-white/5" : ""}`}'
);

fs.writeFileSync(filePath, content);
console.log("Fixed hover effect");
