import fs from 'fs';

const filePath = 'src/app/(app)/tracker/TrackerClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove localStorage reads from useEffect
content = content.replace(
  /useEffect\(\(\) => \{\s*\/\/ Hydrate from localStorage[\s\S]*?setIsMounted\(true\);\s*\}, \[\]\);/m,
  `useEffect(() => {
    setIsMounted(true);
  }, []);`
);

// 2. Remove localStorage writes (Sync to localStorage)
content = content.replace(
  /\/\/ Sync to localStorage[\s\S]*?localStorage\.setItem\("jobs-tracker-column-order", JSON\.stringify\(columnOrder\)\);\n    \}\n  \}, \[columnOrder, isMounted\]\);/m,
  ``
);
content = content.replace(
  /useEffect\(\(\) => \{\s*if \(isMounted\) \{\s*localStorage\.setItem\("jobs-tracker-config", JSON\.stringify\(config\)\);\s*\}\s*\}, \[config, isMounted\]\);/m,
  ``
);

// 3. Intercept initialData and perform the migration ON THE INITIAL STATE
const stateInitRegex = /const \[columns, setColumns\] = useState<Record<string, ColumnData>>\(initialData\.columns\);\s*const \[columnOrder, setColumnOrder\] = useState<string\[\]>\(initialData\.columnOrder\);/m;

const stateInitReplacement = `
  // -- MIGRATION LOGIC (Run once on initialData) --
  const getAnnualSalaryLocal = (job: any) => job.salarioAnual || (job.salarioMensual ? job.salarioMensual * 12 : 0);
  const sortJobsLocal = (jobs: any[]) => [...jobs].sort((a, b) => getAnnualSalaryLocal(b) - getAnnualSalaryLocal(a));

  const initialColumns = { ...initialData.columns };
  let initialOrder = [...(initialData.columnOrder || [])];

  const acceptedJobs: any[] = [];
  const rejectedJobs: any[] = [];
  const idsToRemove = new Set<string>();

  Object.keys(initialColumns).forEach(colId => {
    const titleLower = initialColumns[colId].title.toLowerCase();
    if (titleLower.includes('aceptada')) {
      acceptedJobs.push(...initialColumns[colId].jobs);
      idsToRemove.add(colId);
    } else if (titleLower.includes('no continuam') || titleLower.includes('rechazad')) {
      rejectedJobs.push(...initialColumns[colId].jobs);
      idsToRemove.add(colId);
    }
  });

  idsToRemove.forEach(id => delete initialColumns[id]);
  initialOrder = initialOrder.filter(id => !idsToRemove.has(id) && id !== 'col-accepted' && id !== 'col-rejected');

  if (!initialColumns['col-accepted']) {
    initialColumns['col-accepted'] = { id: 'col-accepted', title: 'Aceptadas', jobs: sortJobsLocal(acceptedJobs), badge: 'bg-green-500/20 text-green-500', wrapperBg: '', cardBg: '', cardHover: '' };
  } else {
    initialColumns['col-accepted'].jobs.push(...acceptedJobs);
    initialColumns['col-accepted'].jobs = sortJobsLocal(initialColumns['col-accepted'].jobs);
  }

  if (!initialColumns['col-rejected']) {
    initialColumns['col-rejected'] = { id: 'col-rejected', title: 'No Continuamos', jobs: sortJobsLocal(rejectedJobs), badge: 'bg-red-500/20 text-red-500', wrapperBg: '', cardBg: '', cardHover: '' };
  } else {
    initialColumns['col-rejected'].jobs.push(...rejectedJobs);
    initialColumns['col-rejected'].jobs = sortJobsLocal(initialColumns['col-rejected'].jobs);
  }
  // -- END MIGRATION LOGIC --

  const [columns, setColumns] = useState<Record<string, ColumnData>>(initialColumns);
  const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);
`;

content = content.replace(stateInitRegex, stateInitReplacement);

// 4. Safely filter out undefined columns in rendering to prevent wrapperBg crash forever
content = content.replace(
  /\{columnOrder\.map\(\(columnId, index\) => \{\s*const column = columns\[columnId as keyof typeof columns\];/g,
  `{columnOrder.map((columnId, index) => {
              const column = columns[columnId as keyof typeof columns];
              if (!column) return null;`
);


fs.writeFileSync(filePath, content);
console.log('Fixed TrackerClient state logic');
