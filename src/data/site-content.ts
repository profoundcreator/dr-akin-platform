export interface PageSection {
  title: string;
  body: string;
  bullets?: string[];
}

export interface PageContent {
  slug: string;
  title: string;
  kicker: string;
  headline: string;
  description: string;
  sections: PageSection[];
  cta?: { label: string; href: string };
  relatedLinks?: { label: string; href: string }[];
}

export const SITE_PAGES: Record<string, PageContent> = {
  work: {
    slug: "work",
    title: "Work — Dr. Akin Akinpelu",
    kicker: "Work",
    headline: "Four operating arms building institutions that endure",
    description:
      "Dr. Akin Akinpelu works across corporate transformation, educational reform, execution strategy, and technology alliances — helping leaders turn vision into durable systems.",
    sections: [
      {
        title: "Integrated ecosystem",
        body: "Each platform addresses a distinct sphere of leadership and institutional development, while sharing a common commitment to African excellence and global impact.",
      },
    ],
    relatedLinks: [
      { label: "AALD — Corporate Transformation", href: "/work/aald" },
      { label: "Erudio Hub — Educational Reform", href: "/work/erudio-hub" },
      { label: "PERFORMX — Execution Think Tank", href: "/work/performx" },
      { label: "TC Resource Technology", href: "/work/tc-resource-technology" },
    ],
    cta: { label: "Discuss a partnership", href: "/book-dr-akin" },
  },
  "work-aald": {
    slug: "work/aald",
    title: "AALD — Corporate Transformation",
    kicker: "Corporate Transformation",
    headline: "African Academy of Leadership Development",
    description:
      "AALD develops leaders at every level through structured programmes, corporate consulting, and a community of purpose-driven executives.",
    sections: [
      {
        title: "What we do",
        body: "End-to-end corporate transformation engagements — from diagnostic assessments to culture redesign, change management, and sustained performance.",
        bullets: [
          "Executive leadership programmes",
          "Organisational diagnostics",
          "Culture and values alignment",
          "Change leadership support",
        ],
      },
    ],
    cta: { label: "Invite Dr. Akin to speak", href: "/meet-akin/speaking" },
  },
  "work-erudio-hub": {
    slug: "work/erudio-hub",
    title: "Erudio Hub — Educational Reform",
    kicker: "Educational Reform",
    headline: "Reforming how a continent teaches and governs",
    description:
      "Erudio Hub drives systemic reform of how nations teach, govern schools, and develop the next generation of African educators and administrators.",
    sections: [
      {
        title: "Focus areas",
        body: "Policy advisory, institutional design, and capacity building for ministries, universities, and education boards.",
        bullets: [
          "Curriculum and governance reform",
          "Teacher development pathways",
          "Public-private education partnerships",
          "Accreditation and quality assurance",
        ],
      },
    ],
    cta: { label: "Start a conversation", href: "/book-dr-akin" },
  },
  "work-performx": {
    slug: "work/performx",
    title: "PERFORMX — Execution Think Tank",
    kicker: "Execution Think Tank",
    headline: "Turning strategy into disciplined execution",
    description:
      "PERFORMX is a high-performance practice helping leaders and operating teams convert ambitious plans into measurable outcomes.",
    sections: [
      {
        title: "Capabilities",
        body: "Execution frameworks, operating rhythm design, and leadership coaching for teams under pressure.",
        bullets: [
          "Strategy-to-execution diagnostics",
          "OKR and accountability systems",
          "Leadership team alignment",
          "Performance culture design",
        ],
      },
    ],
    cta: { label: "Book an advisory session", href: "/book-dr-akin" },
  },
  "work-tc": {
    slug: "work/tc-resource-technology",
    title: "TC Resource Technology",
    kicker: "Tech Alliances",
    headline: "Technology partnerships for institutional scale",
    description:
      "TC Resource Technology connects enterprises and institutions with the technology alliances needed to scale operations and deliver impact.",
    sections: [
      {
        title: "Partnership model",
        body: "Strategic technology advisory, vendor selection, and implementation oversight for complex organisational transformations.",
        bullets: [
          "Digital transformation roadmaps",
          "Enterprise systems advisory",
          "Technology vendor partnerships",
          "Implementation governance",
        ],
      },
    ],
    cta: { label: "Explore an alliance", href: "/book-dr-akin" },
  },
  "meet-akin": {
    slug: "meet-akin",
    title: "Meet Dr. Akin",
    kicker: "Meet Dr. Akin",
    headline: "Leadership across four spheres of influence",
    description:
      "Dr. Akin Akinpelu Ph.D is an executive coach, author, and corporate transformation strategist working at the intersection of business, education, public policy, and marketplace ministry.",
    sections: [
      {
        title: "Four spheres",
        body: "His work spans corporate boardrooms, classrooms, policy chambers, and faith-driven marketplace leadership — with a single through-line: building institutions that outlast their founders.",
      },
    ],
    relatedLinks: [
      { label: "Profile & credentials", href: "/meet-akin/profile" },
      { label: "Continental mandate", href: "/meet-akin/au-ambassador" },
      { label: "Board governance", href: "/meet-akin/edu-governance" },
      { label: "Keynote speaking", href: "/meet-akin/speaking" },
    ],
  },
  "meet-profile": {
    slug: "meet-akin/profile",
    title: "Profile — Dr. Akin Akinpelu",
    kicker: "Profile",
    headline: "Biography and credentials",
    description:
      "Dr. Akin Akinpelu brings decades of experience in executive coaching, organisational consulting, and leadership development across Africa and the global diaspora.",
    sections: [
      {
        title: "Background",
        body: "A sought-after advisor to C-suite leaders, boards, and institutions, Dr. Akin has authored multiple books on leadership, execution, and institutional transformation.",
        bullets: [
          "Executive coach and corporate strategist",
          "Author of nine published titles",
          "Founder of the AALD ecosystem",
          "Advisor to governments and enterprises",
        ],
      },
    ],
  },
  "meet-au": {
    slug: "meet-akin/au-ambassador",
    title: "Continental Mandate — AU Agenda 2063",
    kicker: "Continental Mandate",
    headline: "African Union Agenda 2063 and continental leadership",
    description:
      "Dr. Akin serves as a voice for Africa's transformation agenda, connecting continental aspirations with practical leadership development.",
    sections: [
      {
        title: "Agenda 2063",
        body: "Working with leaders and institutions aligned with the African Union's vision for an integrated, prosperous, and peaceful Africa.",
      },
    ],
  },
  "meet-edu": {
    slug: "meet-akin/edu-governance",
    title: "Board Governance — Dr. Akin Akinpelu",
    kicker: "Board Governance",
    headline: "Boards, advisory roles, and governance excellence",
    description:
      "Dr. Akin advises boards and governance bodies on leadership transitions, fiduciary responsibility, and long-term institutional stewardship.",
    sections: [
      {
        title: "Governance focus",
        body: "Supporting boards through complexity — from succession planning to stakeholder alignment and ethical leadership.",
      },
    ],
  },
  "meet-speaking": {
    slug: "meet-akin/speaking",
    title: "Keynote Speaking — Dr. Akin Akinpelu",
    kicker: "Keynote Speaking",
    headline: "Stages, summits, and executive engagements",
    description:
      "Dr. Akin delivers keynotes, panel contributions, workshops, and fireside conversations for conferences, corporate retreats, and leadership summits worldwide.",
    sections: [
      {
        title: "Before you book",
        body: "Speaking invitations are reviewed by the Executive Assistant team. Submit a structured request with event details, audience profile, and proposed dates.",
        bullets: [
          "Keynotes and opening addresses",
          "Panel moderation and fireside conversations",
          "Executive workshops and masterclasses",
          "In-person, virtual, and hybrid formats",
        ],
      },
      {
        title: "What happens next",
        body: "After submission you receive a booking reference, confirmation email, and secure tracking link. Initial status: Received. Response within 3–5 business days.",
      },
    ],
    cta: { label: "Submit a speaking invitation", href: "/book-dr-akin" },
  },
  resources: {
    slug: "resources",
    title: "Resources — Library & Archives",
    kicker: "Resources",
    headline: "Books, frameworks, and leadership resources",
    description:
      "Nine published titles and a growing archive of essays, keynotes, and teaching materials for leaders, educators, and marketplace practitioners.",
    sections: [
      {
        title: "Library",
        body: "Dr. Akin's published works distil decades of coaching and consulting into actionable frameworks.",
      },
      {
        title: "Marketplace Ministry",
        body: "Faith-driven leadership for believers shaping culture, law, government, and business.",
        bullets: ["Books and teaching series", "Conference keynotes", "Mentorship frameworks"],
      },
      {
        title: "High Performance",
        body: "Process, execution, and operational excellence for leaders under pressure.",
      },
      {
        title: "Academic Excellence",
        body: "Resources for students, educators, and institutional leaders.",
      },
      {
        title: "Audio Archives",
        body: "Selected keynotes and conversations available for organisational learning.",
      },
    ],
    cta: { label: "Browse insights", href: "/insights" },
  },
  insights: {
    slug: "insights",
    title: "Insights & Writing",
    kicker: "Insights",
    headline: "Essays and field notes on leadership and transformation",
    description:
      "Practical perspectives drawn from executive coaching, organisational consulting, and real-world transformation programmes.",
    sections: [],
  },
  "organizer-resources": {
    slug: "organizer-resources",
    title: "Organizer Resources",
    kicker: "Organizer Resources",
    headline: "Approved biographies, photographs, and event materials",
    description:
      "Current approved versions of speaker materials for confirmed engagements. Access to additional resources is provided after booking confirmation.",
    sections: [
      {
        title: "Available materials",
        body: "Short, medium, and full biographies; official headshots; introduction scripts; and technical requirements.",
        bullets: [
          "Biography (short, medium, full)",
          "Official headshots and photographs",
          "Preferred introduction script",
          "AV and technical requirements",
        ],
      },
    ],
    cta: { label: "Submit a booking request", href: "/book-dr-akin" },
  },
};

export interface InsightArticle {
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  date: string;
}

export const INSIGHT_ARTICLES: InsightArticle[] = [
  {
    slug: "culture-as-strategic-asset",
    title: "Culture as a Strategic Asset",
    category: "Corporate Transformation",
    summary:
      "How high-performing organisations embed values into daily decisions, not just boardroom slides.",
    date: "2026-01-15",
    body: "Culture is not a poster on the wall — it is the operating system of every institution. Leaders who treat culture as a strategic asset invest in the behaviours, rituals, and accountability structures that make values visible in daily decisions.",
  },
  {
    slug: "executive-mindset-shift",
    title: "The Executive Mindset Shift",
    category: "Executive Coaching",
    summary:
      "Why the transition from functional expert to enterprise leader demands a new identity, not just new skills.",
    date: "2025-11-02",
    body: "The most common failure mode in executive transitions is skill accumulation without identity transformation. Enterprise leaders must learn to create clarity, distribute authority, and measure outcomes they do not directly control.",
  },
  {
    slug: "leading-through-disruption",
    title: "Leading Through Disruption",
    category: "Leadership",
    summary:
      "Frameworks for maintaining clarity, trust, and momentum when markets and teams are under pressure.",
    date: "2025-09-18",
    body: "Disruption compresses decision timelines and amplifies uncertainty. Leaders who thrive in these moments communicate more frequently, simplify priorities ruthlessly, and protect psychological safety while demanding execution.",
  },
  {
    slug: "measuring-transformation-roi",
    title: "Measuring Transformation ROI",
    category: "Strategy",
    summary:
      "Connecting people development initiatives to revenue, retention, and operational excellence.",
    date: "2025-07-08",
    body: "Transformation programmes fail when they cannot demonstrate business impact. Establish baseline metrics early, tie interventions to operational KPIs, and report progress in language the board understands.",
  },
];

export const LIBRARY_BOOKS = [
  { slug: "leadership-blueprint", title: "The Leadership Blueprint", year: "2024", category: "Leadership" },
  { slug: "culture-by-design", title: "Culture by Design", year: "2023", category: "Organisational Development" },
  { slug: "executive-presence", title: "Executive Presence", year: "2022", category: "Personal Development" },
  { slug: "transform-or-be-transformed", title: "Transform or Be Transformed", year: "2021", category: "Strategy" },
  { slug: "leading-africa-forward", title: "Leading Africa Forward", year: "2020", category: "Leadership" },
  { slug: "coaching-mindset", title: "The Coaching Mindset", year: "2019", category: "Coaching" },
];
