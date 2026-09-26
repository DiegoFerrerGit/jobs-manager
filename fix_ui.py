with open("src/components/JobsClientView.tsx", "r") as f:
    content = f.read()

# 1. Remove the count from the old place
old_count_block = """          {/* Job Count */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold shrink-0 shadow-sm">
            <span>{processedJobs.length}</span>
            <span className="font-medium text-xs opacity-80">
              {processedJobs.length === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>

"""
content = content.replace(old_count_block, "")

# 2. Add count after filters (right before the end of the left side div)
target_filters_end = """              Limpiar
            </button>
          )}
        </div>"""

new_filters_end = """              Limpiar
            </button>
          )}
          
          {/* Job Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold shrink-0 shadow-sm">
            <span>{processedJobs.length}</span>
            <span className="font-medium text-[11px] opacity-80 uppercase tracking-wide">
              {processedJobs.length === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>
        </div>"""
content = content.replace(target_filters_end, new_filters_end)

# 3. Fix the spacing around the hyphen (remove mx-1)
content = content.replace('className="text-muted-foreground/50 mx-1 shrink-0"', 'className="text-muted-foreground/50 shrink-0"')

with open("src/components/JobsClientView.tsx", "w") as f:
    f.write(content)
