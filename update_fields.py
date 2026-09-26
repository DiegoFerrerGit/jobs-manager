import re

with open("src/components/JobsClientView.tsx", "r") as f:
    content = f.read()

replacements = {
    r'\.titulo': '.title',
    r'\.empresa': '.company',
    r'\.ubicaciones': '.locations',
    r'\.acepta_argentina': '.acceptsArgentina',
    r'\.prioridad': '.priority',
    r'\.empleados': '.companySize',
    r'\.salario': '.salary',
    r'\.motivo': '.locationMatch',
    r'\.url_aplicar': '.applyUrl',
    r'\.linkedin_empresa': '.companyLinkedin',
    r'\.fecha_publicacion': '.publishedAt',
    r'\.fecha_detectada': '.detectedAt'
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

# Specific fixes for the new schema types
# 1. getPriorityWeight is no longer needed since priority is an integer
content = content.replace(
    'cmp = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);',
    'cmp = (a.priority || 3) - (b.priority || 3);'
)

# 2. companySize is now a number, not a string
content = content.replace(
    '''const empA = a.companySize ? parseInt(a.companySize.replace(/\D/g, '')) || 0 : 0;
        const empB = b.companySize ? parseInt(b.companySize.replace(/\D/g, '')) || 0 : 0;''',
    '''const empA = a.companySize || 0;
        const empB = b.companySize || 0;'''
)

# 3. getLatamWeight enum values: "yes" and "maybe" instead of "si" and "posible"
content = content.replace('val === "si"', 'val === "yes"')
content = content.replace('val === "posible"', 'val === "maybe"')
content = content.replace('a.acceptsArgentina === filterLatam', 'a.acceptsArgentina === (filterLatam === "si" ? "yes" : filterLatam === "posible" ? "maybe" : "all")')

# 4. Display of priority badges: it's now 1, 2, 3 instead of "1 alta", "2 media"
content = content.replace('job.priority?.includes("alta")', 'job.priority === 1')
content = content.replace('job.priority?.includes("media")', 'job.priority === 2')

# 5. Display of LATAM badges
content = content.replace('job.acceptsArgentina === "si" || job.acceptsArgentina === "posible"', 'job.acceptsArgentina === "yes" || job.acceptsArgentina === "maybe"')
content = content.replace('job.acceptsArgentina === "si"', 'job.acceptsArgentina === "yes"')

# 6. For companySize rendering, it's just a number
content = content.replace('{job.companySize} empleados', '{job.companySize} empleados')

with open("src/components/JobsClientView.tsx", "w") as f:
    f.write(content)
