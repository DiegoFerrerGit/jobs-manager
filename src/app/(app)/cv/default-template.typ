#import "silver-dev-cv/lib.typ": *

#show: cv.with(
  font-type: "PT Serif",
  continue-header: "false",
  name: "",
  address: "",
  lastupdated: "false",
  pagecount: "false",
  date: "2026-01-01",
  contacts: (),
)

#let accent = rgb("#4A86C5")
#let dark = rgb("#111111")

#v(-35pt)
#align(center)[
  #set text(
    font: "PT Serif",
    fill: dark,
    top-edge: "bounds",
    bottom-edge: "bounds",
  )

  #text(size: 18pt, weight: "bold")[DIEGO FERRER]

  #v(-3pt)

#text(size: 12.2pt, weight: "bold", fill: accent)[Engineering Manager]
#text(size: 10.5pt, weight: "bold", fill: accent)[ | FinTech/Startups | AWS Solutions Architect | Applied GenAI]

  #link("https://www.linkedin.com/in/ferrerdiego1994/")[
    #text(size: 10pt, fill: dark)[linkedin.com/in/ferrerdiego1994]
  ]
  #text(size: 10pt, fill: dark)[ | ]
  #link("mailto:diegoferrer.jobs@gmail.com")[
    #text(size: 10pt, fill: dark)[diegoferrer.jobs\@gmail.com]
  ]
  #text(size: 10pt, fill: dark)[ | Argentina]
]

#v(10pt)


// Summary
#section[Summary]
#descript[
Engineering Manager with #text(weight: "bold")[15+ years in software], #text(weight: "bold")[10+ in FinTech], and #text(weight: "bold")[6 years leading engineering teams]. Proven track record scaling #text(weight: "bold")[fintech and digital products] from #text(weight: "bold")[prototype to production] and improving #text(weight: "bold")[reliability, delivery predictability, and engineering standards] in high-growth companies. Strong background across #text(weight: "bold")[Angular, React, Node.js, Python, and AWS serverless]. Currently leading an #text(weight: "bold")[AI-native team] applying #text(weight: "bold")[LLMs and agentic workflows] to algorithmic trading.
]

#sectionsep

// Languages
#section("Languages")
#text(weight: "bold", fill: accent)[Spanish] (Native) - #text(weight: "bold", fill: accent)[English] (Professional Working Proficiency - B2+)

#sectionsep

#sectionsep

// Certifications (ATS-friendly: grouped, short)
#section("Certifications")
#oneline-title-item(
    title: [#text(fill: accent)[AWS]],
    content: [Solutions Architect Associate],
)


#sectionsep

#sectionsep

// Core Skills
#section("Core Skills")
#oneline-title-item(
  title: [#text(fill: accent)[Fullstack Development]],
  content: [Angular, React, TypeScript, Next.js, JavaScript, Node.js, NestJS, Python, Golang],
)
#oneline-title-item(
  title: [#text(fill: accent)[Architecture & Development]],
  content: [Microservices, Event-driven Design, Scalable Cloud Solutions, API Integration, System Design, Modularization, Clean Architecture],
)
#oneline-title-item(
  title: [#text(fill: accent)[Infrastructure & DevOps]],
  content: [AWS, Azure, Docker, CI/CD Pipelines (GitHub Actions, BitBucket), Observability, Monitoring],
)
#oneline-title-item(
  title: [#text(fill: accent)[AI & Data Science]],
  content: [Generative AI (GenAI), LLM Integration, Prompt Design, Agentic Workflows, Machine Learning (ML) Integration, n8n Automation],
)
#oneline-title-item(
  title: [#text(fill: accent)[Methodologies]],
  content: [Agile (Scrum, Kanban), Product Roadmap Planning, Release Management],
)
#oneline-title-item(
  title: [#text(fill: accent)[Technical Leadership & Management]],
  content: [Team Mentoring, Engineering Management, Cross-functional Collaboration, Stakeholder Alignment, KPI & Delivery Metrics],
)
#oneline-title-item(
  title: [#text(fill: accent)[Systems & Platforms]],
  content: [AWS Cloud (Serverless, Lambda, DynamoDB, S3), FinTech Wallets, Algorithmic Trading Systems],
)


#sectionsep

// Experience
#section("Experience")

#v(4pt)
#grid(
  columns: (1fr, auto),
  column-gutter: 12pt,
  align: top,
  [
    #text(weight: "bold", fill: accent)[Head of Engineering] | #emph[Aiyra]
  ],
  [
    #align(right)[
      #emph[Miami, FL (Remote) | Jul 2025 – Current]
    ]
  ],
)

#v(4pt)

- #text(weight: "bold")[Team Leadership:] Built the engineering department from scratch; currently lead a team of 15, owning hiring, mentoring and development standards.
- #text(weight: "bold")[AI-Native Engineering:] Built an AI-native team using coding assistants and agents across the development lifecycle to ship faster without compromising quality.
- #text(weight: "bold")[Technical Strategy:] Define architecture and technical roadmap alongside the C-level for algorithmic trading bots and real-time market data pipelines.
- #text(weight: "bold")[GenAI for Trading:] Lead the integration of LLMs and agentic workflows to automate financial decision-making and internal operations.
- #text(weight: "bold")[Execution & Standards:] Took the first production prototype live in 4 months, with CI/CD on GitHub Actions and workflow automation via n8n.
- #text(weight: "bold")[Stack:] Python, LLMs, Agentic Workflows, n8n, CI/CD, GitHub Actions.

#v(10pt)
#v(10pt)
#v(10pt)
#v(10pt)
#v(4pt)
#grid(
  columns: (1fr, auto),
  column-gutter: 12pt,
  align: top,
  [
    #text(weight: "bold", fill: accent)[Engineering Manager] | #emph[Modak]
  ],
  [
    #align(right)[
      #emph[San Francisco, CA (Remote) | Apr 2022 – Jun 2025]
    ]
  ],
)

#v(4pt)

- #text(weight: "bold")[0-to-1 Scaling:] Led engineering growth during the company's pivot to FinTech. Managed 2 cross-functional teams (13 engineers) and maintained #text(weight: "bold")[99.98% uptime] during hyper-growth.
- #text(weight: "bold")[Cloud Architecture:] Architected the foundational #text(weight: "bold")[AWS Serverless] platform (Lambda, DynamoDB) alongside tech leads, successfully reducing system latency by #text(weight: "bold")[35%].
- #text(weight: "bold")[Product Delivery:] Partnered directly with C-Level, Compliance, and Legal to launch 3 core financial products in under 6 months, driving a #text(weight: "bold")[40% increase in active users].
- #text(weight: "bold")[Team & Talent Scaling:] Directed the technical hiring pipeline and established performance frameworks, successfully mentoring individual contributors into squad leadership roles.
- #text(weight: "bold")[Operational Excellence:] Institutionalized engineering standards, implementing advanced CI/CD pipelines and #text(weight: "bold")[Observability] metrics that cut deployment incidents by #text(weight: "bold")[30%].
- #text(weight: "bold")[Fullstack Evolution:] Joined as the foundational frontend hire, rapidly expanding scope to manage #text(weight: "bold")[Node.js] and #text(weight: "bold")[Golang] backend services and define the web stack.
- #text(weight: "bold")[Stack:] AWS Lambda, DynamoDB, Angular, TypeScript, Node.js, NestJS, Golang, Serverless, Observability.

#v(10pt)

#grid(
  columns: (1fr, auto),
  column-gutter: 12pt,
  align: top,
  [
    #text(weight: "bold", fill: accent)[Engineering Manager - Tech Lead (Full Stack)] | #emph[UNX Digital]
  ],
  [
    #align(right)[
      #emph[United States (Remote) | Oct 2020 – Apr 2022]
    ]
  ],
)

#v(4pt)

- #text(weight: "bold")[Project Management:] Led a team of 7 developers in the creation of a #text(weight: "bold")[Virtual Wallet] (FinTech), improving delivery predictability and team performance metrics.
- #text(weight: "bold")[Fullstack Implementation:] Directed the development of end-to-end solutions using #text(weight: "bold")[Angular], #text(weight: "bold")[NestJS/Node.js], and #text(weight: "bold")[SQL Server].
- #text(weight: "bold")[DevOps & Infrastructure:] Drove #text(weight: "bold")[Containerization] strategies with #text(weight: "bold")[Docker] and automated deployment workflows on #text(weight: "bold")[Azure].
- #text(weight: "bold")[Quality Assurance:] Integrated #text(weight: "bold")[Unit Testing] (Karma, Jasmine) and mentored the team in high-quality code standards under Scrum.
- #text(weight: "bold")[Stack:] Angular, NestJS, Node.js, SQL Server, Docker, Azure, Scrum.

#v(10pt)


#text(fill: accent, weight: "bold")[Prior Experience | 2010–2020]

#v(4pt)

#oneline-title-item(
  title: [#text(fill: accent, weight: "bold")[Enterprise & FinTech Experience]],
  content: [
    #text(weight: "bold")[Globant], #text(weight: "bold")[Accenture], and #text(weight: "bold")[IBM] — Frontend engineering experience across enterprise and banking-related projects using Angular and modern web technologies, with additional AI-related project exposure at IBM (IBM-Watson).
  ],
)

#oneline-title-item(
  title: [#text(fill: accent, weight: "bold")[Frontend & Fullstack Development]],
  content: [
    #text(weight: "bold")[Apperto] and #text(weight: "bold")[Sunset] — Frontend/fullstack development experience building web applications with Angular, Dart, SQL, JavaScript, and related technologies.
  ],
)

#v(10pt)

#sectionsep

/* 
#section("Education")
#education(
  institution: [UP | University of Palermo],
  major: [Engineering Degree in Artificial Intelligence (In progress)],
  date: "In progress",
  location: "Argentina",
)
*/


#set document(author: "Diego Ferrer", title: "Diego Ferrer - ATS Resume")

