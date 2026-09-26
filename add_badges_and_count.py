import re

with open("src/components/JobsClientView.tsx", "r") as f:
    content = f.read()

# 1. Add getSourceBadge function
badge_func = """
const getSourceBadge = (source: string | null | undefined, externalId: string | null | undefined) => {
  const src = source || (externalId ? externalId.split(':')[0] : null);
  if (!src) return null;
  
  const s = src.toLowerCase();
  if (s.includes('gh') || s.includes('greenhouse')) {
    return (
      <span className="text-[11px] text-[#00b289] bg-[#00b289]/10 border border-[#00b289]/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        Greenhouse
      </span>
    );
  }
  if (s.includes('ashby')) {
    return (
      <span className="text-[11px] text-[#8e49ff] bg-[#8e49ff]/10 border border-[#8e49ff]/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        Ashby
      </span>
    );
  }
  if (s.includes('lever')) {
    return (
      <span className="text-[11px] text-[#2c84cc] bg-[#2c84cc]/10 border border-[#2c84cc]/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        Lever
      </span>
    );
  }
  if (s.includes('yc')) {
    return (
      <span className="text-[11px] text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        YCombinator
      </span>
    );
  }
  
  return (
    <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-1 rounded-md font-mono shrink-0 ml-2">
      {src.toUpperCase()}
    </span>
  );
};

export default function JobsClientView"""

content = content.replace("export default function JobsClientView", badge_func)

# 2. Add count badge in Toolbar
old_toolbar = """        {/* Left Side: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 text-sm flex-1">
          {/* Search */}"""

new_toolbar = """        {/* Left Side: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 text-sm flex-1">
          {/* Job Count */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold shrink-0 shadow-sm">
            <span>{processedJobs.length}</span>
            <span className="font-medium text-xs opacity-80">
              {processedJobs.length === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>

          {/* Search */}"""

content = content.replace(old_toolbar, new_toolbar)


# 3. Replace old grid badge logic
old_badge_logic = """                {job.externalId?.startsWith('yc:') ? (
                  <span className="text-[11px] text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
                    YCombinator
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-1 rounded-md font-mono shrink-0 ml-2">
                    {job.externalId?.split(':')[0]?.toUpperCase()}
                  </span>
                )}"""

new_badge_logic = """                {getSourceBadge(job.source, job.externalId)}"""

content = content.replace(old_badge_logic, new_badge_logic)

with open("src/components/JobsClientView.tsx", "w") as f:
    f.write(content)
