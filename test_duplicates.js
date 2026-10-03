const { Client } = require('pg');
function parseCareersUrl(url) {
  if (!url) return null;
  let cleanUrl = url.trim().toLowerCase();
  cleanUrl = cleanUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').split('?')[0];
  let ats = 'custom';
  let slug = '';
  if (cleanUrl.startsWith('jobs.ashbyhq.com/')) {
    ats = 'ashby';
    slug = cleanUrl.replace('jobs.ashbyhq.com/', '').split('/')[0];
  } else if (cleanUrl.startsWith('job-boards.greenhouse.io/')) {
    ats = 'greenhouse';
    slug = cleanUrl.replace('job-boards.greenhouse.io/', '').split('/')[0];
  } else if (cleanUrl.startsWith('boards.greenhouse.io/')) {
    ats = 'greenhouse';
    slug = cleanUrl.replace('boards.greenhouse.io/', '').split('/')[0];
  } else if (cleanUrl.startsWith('jobs.lever.co/')) {
    ats = 'lever';
    slug = cleanUrl.replace('jobs.lever.co/', '').split('/')[0];
  } else if (cleanUrl.includes('.teamtailor.com')) {
    ats = 'teamtailor';
    slug = cleanUrl.split('.teamtailor.com')[0];
  } else if (cleanUrl.includes('.myworkdayjobs.com')) {
    ats = 'workday';
    const host = cleanUrl.split('/')[0];
    const company = host.split('.')[0];
    const match = cleanUrl.match(/\/en-us\/([^\/]+)/);
    const path = match ? match[1] : '';
    slug = path ? `${company}/${path}` : company;
  } else if (cleanUrl.startsWith('apply.workable.com/')) {
    ats = 'workable';
    slug = cleanUrl.replace('apply.workable.com/', '').split('/')[0];
  } else {
    ats = 'custom';
    slug = cleanUrl.split('/')[0];
  }
  return { ats, slug, careersUrl: cleanUrl };
}

(async () => {
  const client = new Client({ connectionString: 'postgresql://jobshunter:jobshunter@localhost:5432/jobshunter' });
  await client.connect();
  const res = await client.query('SELECT id, ats, slug, source, careers_url FROM companies');
  const companies = res.rows;
  const discovered = new Set(companies.filter(c => c.source !== 'manual').map(c => `${c.ats}::${c.slug.toLowerCase()}`));
  
  let duplicates = 0;
  for (const c of companies.filter(c => c.source === 'manual')) {
    const parsed = parseCareersUrl(c.careers_url);
    if (!parsed) continue;
    
    // Existing logic in db
    const currentKey = `${c.ats}::${c.slug.toLowerCase()}`;
    const newKey = `${parsed.ats}::${parsed.slug}`;
    
    // Si la key nueva (normalizada) ya existe entre las descubiertas, es duplicado
    if (discovered.has(newKey)) {
      console.log(`Duplicate found! Manual: ID ${c.id}, DB: (${c.ats}, ${c.slug}), Normalizado: (${parsed.ats}, ${parsed.slug})`);
      duplicates++;
    } else if (discovered.has(currentKey)) {
      console.log(`Duplicate found (current DB)! Manual: ID ${c.id}, DB: (${c.ats}, ${c.slug})`);
      duplicates++;
    }
  }
  console.log(`Total duplicates: ${duplicates}`);
  await client.end();
})();
