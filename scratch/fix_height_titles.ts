import fs from 'fs';

const filePath = 'src/app/(app)/tracker/TrackerClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Kanban column heights (remove h-[85vh], add max-h-[72vh] and flex-col to parent, min-h-0 to child)
content = content.replace(
  /className=\{\`w-\[280px\] shrink-0 mr-4 h-\[85vh\] \$\\{snapshotCol\.isDragging \? 'opacity-80' : ''\\}\`\}/,
  'className={`w-[280px] shrink-0 mr-4 flex flex-col max-h-[72vh] ${snapshotCol.isDragging ? \'opacity-80\' : \'\'}`}'
);

content = content.replace(
  /className="w-full h-full overflow-y-auto custom-scrollbar-v"/,
  'className="w-full overflow-y-auto custom-scrollbar-v min-h-0"'
);

// 2. Fix "No Continuamos" and "Propuestas Aceptadas" titles
const noContTitleRegex = /<h3 className="font-semibold text-red-500 flex items-center gap-2">\s*<span className="w-2 h-2 rounded-full bg-red-500"><\/span>\s*No Continuamos\s*<\/h3>/;
if (content.match(noContTitleRegex)) {
  content = content.replace(noContTitleRegex, `<div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-md text-[13px] font-bold bg-[#d44c47] text-white shadow-sm tracking-wide uppercase">
                        No Continuamos
                      </div>
                    </div>`);
}

const propAceptTitleRegex = /<h3 className="font-semibold text-green-500 flex items-center gap-2">\s*<span className="w-2 h-2 rounded-full bg-green-500"><\/span>\s*Propuestas Aceptadas\s*<\/h3>/;
if (content.match(propAceptTitleRegex)) {
  content = content.replace(propAceptTitleRegex, `<div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-md text-[13px] font-bold bg-[#448361] text-white shadow-sm tracking-wide uppercase">
                        Propuestas Aceptadas
                      </div>
                    </div>`);
}

// 3. To make sure there is no minimum height stretching the board when empty, let's verify if `Droppable droppableId="board"` has a min-height.
// It currently has: className="overflow-x-auto pb-4 custom-scrollbar" (Wait, there was a min-h-[500px] somewhere?)
// Let's replace any min-h-[500px] just in case it exists in the outer board wrappers.
content = content.replace(/className="flex-1 p-4 md:p-8 overflow-y-auto bg-\[#101014\] min-h-\[500px\]"/, 'className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#101014]"');


fs.writeFileSync(filePath, content);
console.log("Fixed Kanban height and finalized titles");
