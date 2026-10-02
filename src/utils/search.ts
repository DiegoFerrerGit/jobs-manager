import { JobWithUserState } from "@/db/schema";

export function filterJobsBySearch(jobs: JobWithUserState[], searchQuery: string): JobWithUserState[] {
  if (searchQuery.trim() === "") return jobs;
  
  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const q = normalize(searchQuery.trim());
  
  // Check for exact company match first
  const exactCompanyMatch = jobs.some(j => normalize(j.company) === q);
  
  if (exactCompanyMatch) {
    return jobs.filter(j => normalize(j.company) === q);
  } else {
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escapedQuery}`);
    
    return jobs.filter(j => 
      regex.test(normalize(j.title)) || 
      regex.test(normalize(j.company))
    );
  }
}
