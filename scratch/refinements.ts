import fs from 'fs';

const filePath = 'src/app/(app)/tracker/TrackerClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Move "Agregar columna" to Header
const headerRegex = /<div className="relative">([\s\S]*?)<button\s*onClick=\{\(\) => setIsColumnDropdownOpen\(!isColumnDropdownOpen\)\}/;
if (content.match(headerRegex)) {
  content = content.replace(headerRegex, `<div className="relative flex items-center gap-3">
            <button
              onClick={addNewColumn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
              Nueva Columna
            </button>
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}`);
}

const addColButtonRegex = /\{\/\* Add new column button \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/Droppable>/;
if (content.match(addColButtonRegex)) {
  content = content.replace(addColButtonRegex, `</div>
            )}
          </Droppable>`);
}

// 2. Change flex-wrap and remove overflow-x-auto
content = content.replace(/className="flex overflow-x-auto pb-4 gap-3 custom-scrollbar"/g, 'className="flex flex-wrap gap-4"');

// 3. Hover effects + 4. Fix fixed widths 
content = content.replace(/className=\{\`\\\$\\{isFinalized \? "shrink-0 w-\[300px\]" : "mb-3"\\} rounded-xl p-3 shadow-sm cursor-pointer group relative transition-colors/g, 'className={`\\${isFinalized ? "w-full sm:w-[280px]" : "mb-3"} rounded-xl p-3 shadow-sm cursor-pointer group relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20');

// 5. Update initialColumns for proper colors
content = content.replace(/if \(!initialColumns\['col-accepted'\]\) \{[\s\S]*?else \{[\s\S]*?initialColumns\['col-accepted'\]\.jobs = sortJobsLocal\(initialColumns\['col-accepted'\]\.jobs\);\s*\}/, `if (!initialColumns['col-accepted']) {
    initialColumns['col-accepted'] = { id: 'col-accepted', title: 'Aceptadas', jobs: sortJobsLocal(acceptedJobs), badge: 'bg-green-500/20 text-green-500', wrapperBg: 'bg-[#1e2621]', cardBg: 'bg-[#283a2d]', cardHover: 'hover:bg-[#304536]' };
  } else {
    initialColumns['col-accepted'].jobs.push(...acceptedJobs);
    initialColumns['col-accepted'].jobs = sortJobsLocal(initialColumns['col-accepted'].jobs);
    initialColumns['col-accepted'].wrapperBg = 'bg-[#1e2621]';
    initialColumns['col-accepted'].cardBg = 'bg-[#283a2d]';
    initialColumns['col-accepted'].cardHover = 'hover:bg-[#304536]';
  }`);

content = content.replace(/if \(!initialColumns\['col-rejected'\]\) \{[\s\S]*?else \{[\s\S]*?initialColumns\['col-rejected'\]\.jobs = sortJobsLocal\(initialColumns\['col-rejected'\]\.jobs\);\s*\}/, `if (!initialColumns['col-rejected']) {
    initialColumns['col-rejected'] = { id: 'col-rejected', title: 'No Continuamos', jobs: sortJobsLocal(rejectedJobs), badge: 'bg-red-500/20 text-red-500', wrapperBg: 'bg-[#2d1d1d]', cardBg: 'bg-[#422828]', cardHover: 'hover:bg-[#4f3030]' };
  } else {
    initialColumns['col-rejected'].jobs.push(...rejectedJobs);
    initialColumns['col-rejected'].jobs = sortJobsLocal(initialColumns['col-rejected'].jobs);
    initialColumns['col-rejected'].wrapperBg = 'bg-[#2d1d1d]';
    initialColumns['col-rejected'].cardBg = 'bg-[#422828]';
    initialColumns['col-rejected'].cardHover = 'hover:bg-[#4f3030]';
  }`);

// Make sure the finalization modal also assigns the correct colors immediately so it doesn't need a reload
content = content.replace(/if \(!newCols\['col-rejected'\]\) newCols\['col-rejected'\] = \{ id: 'col-rejected', title: 'No Continuamos', jobs: \[\], badge: '', wrapperBg: '', cardBg: '', cardHover: '' \};/, `if (!newCols['col-rejected']) newCols['col-rejected'] = { id: 'col-rejected', title: 'No Continuamos', jobs: [], badge: 'bg-red-500/20 text-red-500', wrapperBg: 'bg-[#2d1d1d]', cardBg: 'bg-[#422828]', cardHover: 'hover:bg-[#4f3030]' };`);

content = content.replace(/if \(!newCols\['col-accepted'\]\) newCols\['col-accepted'\] = \{ id: 'col-accepted', title: 'Aceptadas', jobs: \[\], badge: '', wrapperBg: '', cardBg: '', cardHover: '' \};/, `if (!newCols['col-accepted']) newCols['col-accepted'] = { id: 'col-accepted', title: 'Aceptadas', jobs: [], badge: 'bg-green-500/20 text-green-500', wrapperBg: 'bg-[#1e2621]', cardBg: 'bg-[#283a2d]', cardHover: 'hover:bg-[#304536]' };`);

fs.writeFileSync(filePath, content);
console.log("Applied flex-wrap, hover effects, colors and moved add column button.");
