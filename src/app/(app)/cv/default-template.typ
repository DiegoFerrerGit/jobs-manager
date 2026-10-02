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

#let accent = rgb("#448361")
#let dark = rgb("#111111")

#v(-35pt)
#align(center)[
  #set text(
    font: "PT Serif",
    fill: dark,
    top-edge: "bounds",
    bottom-edge: "bounds",
  )

  #text(size: 18pt, weight: "bold")[BARRY ALLEN]

  #v(-3pt)

#text(size: 12.2pt, weight: "bold", fill: accent)[Engineering Manager]
#text(size: 10.5pt, weight: "bold", fill: accent)[ | Cloud Architecture | High-Performance Systems]

  #link("https://www.linkedin.com/in/barryallen-speed/")[
    #text(size: 10pt, fill: dark)[linkedin.com/in/barryallen-speed]
  ]
  #text(size: 10pt, fill: dark)[ | ]
  #link("mailto:barry.allen.fast@gmail.com")[
    #text(size: 10pt, fill: dark)[barry.allen.fast\@gmail.com]
  ]
  #text(size: 10pt, fill: dark)[ | Central City]
]

#v(10pt)


// Summary
#section[Summary]
#descript[
Engineering Manager with #text(weight: "bold")[12+ years of experience] building ultra-low latency systems and scaling high-performance engineering teams. Proven track record leading multidisciplinary teams to deliver #text(weight: "bold")[scalable microservices and robust cloud infrastructures]. Specialized in #text(weight: "bold")[Go, Rust, and distributed systems]. Passionate about mentoring developers and accelerating product delivery cycles while maintaining #text(weight: "bold")[99.999% uptime].
]

#sectionsep

// Languages
#section("Languages")
#text(weight: "bold", fill: accent)[English] (Native) - #text(weight: "bold", fill: accent)[Spanish] (Professional Working Proficiency)

#sectionsep

#sectionsep

// Certifications (ATS-friendly: grouped, short)
#section("Certifications")
#oneline-title-item(
    title: [#text(fill: accent)[GCP]],
    content: [Professional Cloud Architect],
)


#sectionsep

#sectionsep

// Core Skills
#section("Core Skills")
#oneline-title-item(
  title: [#text(fill: accent)[Fullstack Development]],
  content: [Go, Rust, React, TypeScript, C++, Python],
)
#oneline-title-item(
  title: [#text(fill: accent)[Architecture & Development]],
  content: [Microservices, Distributed Systems, Event-Sourcing, CQRS, Real-Time Processing],
)
#oneline-title-item(
  title: [#text(fill: accent)[Infrastructure & DevOps]],
  content: [Kubernetes, GCP, AWS, Terraform, CI/CD, Prometheus, Docker],
)
#oneline-title-item(
  title: [#text(fill: accent)[AI & Data Science]],
  content: [Predictive Analytics, Time-Series Databases, ML Pipelines],
)
#oneline-title-item(
  title: [#text(fill: accent)[Methodologies]],
  content: [Agile, Kanban, OKR Planning, Sprint Retrospectives],
)
#oneline-title-item(
  title: [#text(fill: accent)[Technical Leadership & Management]],
  content: [Cross-functional Management, KPI Metrics, Team Mentoring, Hiring & Onboarding],
)
#oneline-title-item(
  title: [#text(fill: accent)[Systems & Platforms]],
  content: [High-Frequency Trading Systems, Real-Time Analytics, Multi-cloud Environments],
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
    #text(weight: "bold", fill: accent)[Head of Engineering] | #emph[STAR Labs]
  ],
  [
    #align(right)[
      #emph[Central City | Jan 2023 – Current]
    ]
  ],
)

#v(4pt)

- #text(weight: "bold")[Team Leadership:] Led a team of 20+ engineers building high-speed data processing pipelines. Mentored squad leads and grew the team by 40%.
- #text(weight: "bold")[System Optimization:] Directed the migration from monolithic architecture to a distributed microservices ecosystem, reducing system latency by #text(weight: "bold")[85%].
- #text(weight: "bold")[Cloud Architecture:] Architected an event-driven architecture using Kafka and Kubernetes, successfully scaling to handle 50k+ transactions per second.
- #text(weight: "bold")[Agile Delivery:] Implemented agile practices and OKR planning, increasing release frequency by 3x with zero downtime.
- #text(weight: "bold")[Stack:] Go, Rust, Kubernetes, GCP, Terraform, Kafka, React.

#v(10pt)

#grid(
  columns: (1fr, auto),
  column-gutter: 12pt,
  align: top,
  [
    #text(weight: "bold", fill: accent)[Engineering Manager] | #emph[Wayne Enterprises]
  ],
  [
    #align(right)[
      #emph[Gotham | Feb 2019 – Dec 2022]
    ]
  ],
)

#v(4pt)

- #text(weight: "bold")[0-to-1 Scaling:] Scaled the backend engineering team from 4 to 15 engineers. Established coding standards and code review protocols.
- #text(weight: "bold")[Platform Development:] Architected a global distributed event-streaming platform processing millions of telemetry points daily.
- #text(weight: "bold")[DevOps Excellence:] Improved deployment frequency by #text(weight: "bold")[200%] by implementing advanced CI/CD pipelines and infrastructure as code.
- #text(weight: "bold")[Product Delivery:] Partnered with product owners to deliver key features for enterprise logistics software ahead of schedule.
- #text(weight: "bold")[Stack:] C++, Python, AWS, Docker, Jenkins, PostgreSQL, Redis.

#v(10pt)

#grid(
  columns: (1fr, auto),
  column-gutter: 12pt,
  align: top,
  [
    #text(weight: "bold", fill: accent)[Senior Software Engineer] | #emph[Queen Consolidated]
  ],
  [
    #align(right)[
      #emph[Star City | Mar 2015 – Jan 2019]
    ]
  ],
)

#v(4pt)

- #text(weight: "bold")[Microservices Implementation:] Developed scalable Go microservices for real-time tracking systems and IoT integration.
- #text(weight: "bold")[Cloud Migration:] Acted as the technical lead for migrating legacy applications to Kubernetes, decreasing cloud computing costs by #text(weight: "bold")[40%].
- #text(weight: "bold")[Mentorship:] Mentored junior developers and led knowledge-sharing sessions on distributed systems design.
- #text(weight: "bold")[Stack:] Go, Node.js, Kubernetes, MongoDB, RabbitMQ.

#v(10pt)

#grid(
  columns: (1fr, auto),
  column-gutter: 12pt,
  align: top,
  [
    #text(weight: "bold", fill: accent)[Software Engineer] | #emph[Kord Industries]
  ],
  [
    #align(right)[
      #emph[Keystone City | Jun 2010 – Feb 2015]
    ]
  ],
)

#v(4pt)

- #text(weight: "bold")[Core Development:] Built low-level C++ drivers and embedded systems for industrial automation and advanced robotics platforms.
- #text(weight: "bold")[Algorithm Optimization:] Optimized collision detection algorithms, improving processing speeds by 45% for real-time robotic arms.
- #text(weight: "bold")[Test Automation:] Designed and implemented a comprehensive unit and integration testing suite in Google Test (gtest), reducing production bugs by 30%.
- #text(weight: "bold")[Hardware Integration:] Worked closely with hardware engineers to ensure seamless communication between software layers and proprietary sensors.
- #text(weight: "bold")[Stack:] C++, Python, Embedded Linux, RTOS, Google Test, CMake.

#v(10pt)

#grid(
  columns: (1fr, auto),
  column-gutter: 12pt,
  align: top,
  [
    #text(weight: "bold", fill: accent)[Junior Developer] | #emph[LexCorp]
  ],
  [
    #align(right)[
      #emph[Metropolis | Jan 2008 – May 2010]
    ]
  ],
)

#v(4pt)

- #text(weight: "bold")[Backend Maintenance:] Maintained legacy Java backend services for enterprise data management.
- #text(weight: "bold")[Data Migration:] Wrote SQL scripts to safely migrate over 10 million records across relational databases with zero data loss.
- #text(weight: "bold")[Stack:] Java, SQL, Oracle DB.

#sectionsep

#set document(author: "Barry Allen", title: "Barry Allen - ATS Resume")
