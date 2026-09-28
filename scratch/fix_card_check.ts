import fs from 'fs';

const filePath = 'src/app/(app)/tracker/TrackerClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Check to lucide-react imports
if (!content.includes('Check, ')) {
  content = content.replace('import { Plus, Eye, EyeOff, GripVertical, Trash2, CheckCircle2 } from "lucide-react";', 'import { Plus, Eye, EyeOff, GripVertical, Trash2, CheckCircle2, Check } from "lucide-react";');
}

// 2. Add min-h-[145px] to TrackerCard
content = content.replace(
  'className={`\\${isFinalized ? "w-full sm:w-[280px]" : "mb-3"} rounded-xl p-3 shadow-sm cursor-pointer group relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-3 \\${column.cardBg} \\${column.cardHover} border border-white/5 \\${snapshotJob?.isDragging ? "ring-2 ring-primary shadow-lg" : ""} \\${selectedJobId === job.id ? "ring-2 ring-inset ring-blue-500 bg-white/5" : ""}`}',
  'className={`\\${isFinalized ? "w-full sm:w-[280px]" : "mb-3"} min-h-[145px] rounded-xl p-3 shadow-sm cursor-pointer group relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-3 \\${column.cardBg} \\${column.cardHover} border border-white/5 \\${snapshotJob?.isDragging ? "ring-2 ring-primary shadow-lg" : ""} \\${selectedJobId === job.id ? "ring-2 ring-inset ring-blue-500 bg-white/5" : ""}`}'
);

// 3. Add checkmark to color dropdown
const colorDropdownRegex = /<div className=\{\`w-3\.5 h-3\.5 rounded-sm \$\\{colorDef\.badge\.split\(' '\)\[0\]\\}\`\}><\/div>\s*\{colorDef\.name\}\s*<\/button>/g;

content = content.replace(colorDropdownRegex, (match) => {
  return `<div className={\`w-3.5 h-3.5 rounded-sm \${colorDef.badge.split(' ')[0]}\`}></div>
                                                  {colorDef.name}
                                                  {column.wrapperBg === colorDef.wrapperBg && (
                                                    <Check className="w-4 h-4 ml-auto text-white" />
                                                  )}
                                                </button>`;
});

fs.writeFileSync(filePath, content);
console.log("Added min-height and Checkmark to column color picker");
