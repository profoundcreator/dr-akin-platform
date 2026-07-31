import { SITE_IMAGES } from "@/lib/media/site-images";

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
  headlineSecondary?: string;
  description: string;
  sections: PageSection[];
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  relatedLinks?: { label: string; href: string }[];
}

export const SITE_PAGES: Record<string, PageContent> = {
  work: {
    slug: "work",
    title: "Work — Dr. Akin Akinpelu",
    kicker: "Corporate · Academic · Public Policy · Marketplace",
    headline: "One leader. Four operating arms.",
    headlineSecondary: "A single agenda.",
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
    kicker: "AALD · Corporate Transformation",
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
    kicker: "Erudio Hub · Educational Reform",
    headline: "Reforming how a continent teaches",
    headlineSecondary: "and governs.",
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
    kicker: "PERFORMX · Execution Think Tank",
    headline: "Turning strategy into",
    headlineSecondary: "disciplined execution.",
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
    kicker: "TC Resource Tech · Tech Alliances",
    headline: "Technology partnerships for",
    headlineSecondary: "institutional scale.",
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
    kicker: "Corporate · Academic · Public Policy · Marketplace",
    headline: "Leadership across four spheres",
    headlineSecondary: "of influence.",
    description:
      "Dr. Akin Akinpelu Ph.D is an executive coach, author, and corporate transformation strategist working at the intersection of business, education, public policy, and marketplace ministry.",
    sections: [
      {
        title: "Four spheres",
        body: "His work spans corporate boardrooms, classrooms, policy chambers, and faith-driven marketplace leadership — with a single through-line: building institutions that outlast their founders.",
      },
    ],
    cta: { label: "Inquire for advisory", href: "/meet-akin/speaking" },
  },
  "meet-profile": {
    slug: "meet-akin/profile",
    title: "Profile — Dr. Akin Akinpelu",
    kicker: "Profile · Biography & credentials",
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
    cta: { label: "Book a conversation", href: "/book-dr-akin" },
  },
  "meet-au": {
    slug: "meet-akin/au-ambassador",
    title: "Continental Mandate — AU Agenda 2063",
    kicker: "Continental Mandate · AU Agenda 2063",
    headline: "Advancing governance and strategic engagement",
    headlineSecondary: "across Africa.",
    description:
      "Dr. Akin serves as Ambassador for the African Union Agenda 2063 Ambassadors Assembly, advancing political affairs, strategic engagement, and governance advocacy across the continent.",
    sections: [
      {
        title: "Agenda 2063",
        body: "Working with leaders and institutions aligned with the African Union's vision for an integrated, prosperous, and peaceful Africa.",
      },
    ],
    cta: { label: "Start a conversation", href: "/book-dr-akin" },
  },
  "meet-edu": {
    slug: "meet-akin/edu-governance",
    title: "Board Governance — Dr. Akin Akinpelu",
    kicker: "Board Governance · Advisory",
    headline: "Boards, advisory roles, and",
    headlineSecondary: "governance excellence.",
    description:
      "Dr. Akin advises boards and governance bodies on leadership transitions, fiduciary responsibility, and long-term institutional stewardship.",
    sections: [
      {
        title: "Governance focus",
        body: "Supporting boards through complexity — from succession planning to stakeholder alignment and ethical leadership.",
      },
    ],
    cta: { label: "Inquire for advisory", href: "/book-dr-akin" },
  },
  "meet-speaking": {
    slug: "meet-akin/speaking",
    title: "Keynote Speaking — Dr. Akin Akinpelu",
    kicker:
      "Dr. Akin Akinpelu · Keynote Speaker · Consultant · Author · Strategist",
    headline: "A speaker who moves rooms",
    headlineSecondary: "from the main stage to the boardroom.",
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
    cta: { label: "Book Dr. Akin", href: "/book-dr-akin" },
    secondaryCta: { label: "About Dr. Akin", href: "/meet-akin/profile" },
  },
  resources: {
    slug: "resources",
    title: "Resources — Library & Archives",
    kicker: "Resources · Library · Archives",
    headline: "Books, frameworks, and leadership resources",
    headlineSecondary: "for builders of institutions.",
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

export interface PurchaseLink {
  label: string;
  url: string;
}

export interface LibraryBook {
  slug: string;
  title: string;
  subtitle?: string;
  year?: string;
  category: string;
  cover: string;
  description: string;
  purchaseLinks?: PurchaseLink[];
  featured?: boolean;
}

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    slug: "the-agenda",
    title: "The Agenda",
    subtitle: "The Rise of Kings and Priests",
    category: "Marketplace Ministry",
    cover: SITE_IMAGES.books["the-agenda"],
    description:
      "A globally minded call to believers and leaders shaping culture, law, government, and business—a blueprint for stepping into the rooms where civilization is being formed.",
    featured: true,
    purchaseLinks: [{ label: "Selfany", url: "https://selfany.com/theagendabook" }],
  },
  {
    slug: "called-but-missing",
    title: "Called But Missing",
    category: "Marketplace Ministry",
    cover: SITE_IMAGES.books["called-but-missing"],
    description:
      "A call to believers who carry influence in the marketplace to step fully into their God-given assignment.",
    purchaseLinks: [
      { label: "Selfany", url: "https://selfany.com/cbm" },
      { label: "Paystack (eBook - NGN)", url: "https://paystack.com/buy/called-but-missing-bmjwbr" },
    ],
  },
  {
    slug: "from-the-streets-to-forbes",
    title: "From the Streets to Forbes",
    category: "High Performance",
    cover: SITE_IMAGES.books["from-the-streets-to-forbes"],
    description:
      "The journey from humble beginnings to global recognition — and the disciplines that sustain leaders under pressure.",
    purchaseLinks: [
      { label: "Paystack (Paperback - NGN)", url: "https://paystack.com/buy/streets-to-forbes-hardcopy" },
      { label: "Paystack (eBook - NGN)", url: "https://paystack.com/buy/streets-to-forbes-ebook" },
      { label: "Selar", url: "https://selar.com/537g39" },
    ],
  },
  {
    slug: "networking-your-way-to-the-top",
    title: "Networking Your Way to the Top",
    category: "High Performance",
    cover: SITE_IMAGES.books["networking-your-way-to-the-top"],
    description:
      "Strategic relationship-building for leaders who understand that influence is built through people, not platforms alone.",
    purchaseLinks: [
      {
        label: "Amazon Paperback",
        url: "https://www.amazon.com/Networking-Your-Way-Top-people-networth/dp/B0D1NZ51F1",
      },
      {
        label: "Amazon Kindle",
        url: "https://www.amazon.com/Networking-Your-Way-Top-people-networth-ebook/dp/B0DXZS74KQ/ref=monarch_sidesheet_title",
      },
      { label: "Selar", url: "https://selar.com/a34xl7" },
    ],
  },
  {
    slug: "stay-in-your-process",
    title: "Stay in Your Process",
    category: "Marketplace Ministry",
    cover: SITE_IMAGES.books["stay-in-your-process"],
    description:
      "Why process discipline — not shortcuts — is the foundation of lasting success in leadership and enterprise.",
    purchaseLinks: [
      {
        label: "Flutterwave (Paperback & Audio Book - USD)",
        url: "https://flutterwave.com/pay/siyp3",
      },
      {
        label: "Paystack (Paperback - NGN)",
        url: "https://paystack.com/buy/stay-in-your-process-hard-copy--audio-book-vnceir",
      },
      { label: "Paystack (eBook - NGN)", url: "https://paystack.com/buy/stay-in-your-process-prtybx" },
      { label: "Flutterwave (Audio Book - USD)", url: "https://flutterwave.com/pay/siyp2" },
      {
        label: "Paystack (Audio Book - NGN)",
        url: "https://paystack.com/buy/stay-in-your-process-audio-book-ngn-netbbf",
      },
    ],
  },
  {
    slug: "not-guilty",
    title: "Not Guilty",
    subtitle: "Understanding the Scandal of Grace",
    category: "Marketplace Ministry",
    cover: SITE_IMAGES.books["not-guilty"],
    description:
      "A theological and practical exploration of grace, conviction, and influence in the life of the marketplace believer.",
    purchaseLinks: [
      { label: "Paystack (Paperback - NGN)", url: "https://paystack.com/buy/notguilty-hardcopy" },
      {
        label: "Amazon Kindle",
        url: "https://www.amazon.com/Not-Guilty-Understanding-Scandal-Grace-ebook/dp/B0DXQGF63R/",
      },
      { label: "Paystack (eBook - USD)", url: "https://paystack.com/buy/notguilty-usd" },
      { label: "Paystack (eBook - NGN)", url: "https://paystack.com/buy/notguilty" },
    ],
  },
  {
    slug: "dominion",
    title: "Dominion",
    subtitle: "The Now Technology of the Spirit To Unlock the Power of Heaven Within You",
    category: "Marketplace Ministry",
    cover: SITE_IMAGES.books.dominion,
    description:
      "Reclaiming God-given authority in culture, commerce, and public life — for leaders called to shape nations.",
    purchaseLinks: [
      { label: "Paystack (Paperback - NGN)", url: "https://paystack.com/buy/dominion" },
      { label: "Paystack (eBook - NGN)", url: "https://paystack.com/buy/dominion-soft-copy" },
      {
        label: "Amazon Kindle",
        url: "https://www.amazon.com/Dominion-Technology-Spirit-Akin-Akinpelu-ebook/dp/B0DY1VPMNW?ref_=ast_author_dp&th=1&psc=1",
      },
    ],
  },
  {
    slug: "the-seven-star-student",
    title: "The Seven Star Student",
    category: "Academic Excellence",
    cover: "/images/books/the-seven-star-student.png",
    description:
      "A framework for students building leadership, innovation, and community impact — aligned with the disciplines that shape Africa's next generation of builders.",
    purchaseLinks: [
      { label: "Paystack (eBook - NGN)", url: "https://paystack.com/buy/7-star-student" },
      {
        label: "Amazon Kindle",
        url: "https://www.amazon.com/Seven-Star-Student-Akin-Akinpelu-ebook/dp/B0DXVZ653N?ref_=ast_author_dp&th=1&psc=1",
      },
    ],
  },
  {
    slug: "the-seven-star-teacher",
    title: "The Seven Star Teacher",
    subtitle: "Towards Improving Transformative Learning In Africa",
    category: "Academic Excellence",
    cover: "/images/books/the-seven-star-teacher.png",
    description:
      "A call to educators and institutional leaders to raise the standard of teaching, governance, and transformative learning across the continent.",
    purchaseLinks: [
      {
        label: "Amazon Paperback",
        url: "https://www.amazon.com/Star-Teacher-Improving-Transformative-Learning/dp/B0D2TYZMXX",
      },
      { label: "Paystack (Paperback - NGN)", url: "https://paystack.com/buy/the-7-star-teacher" },
      { label: "Paystack (eBook - NGN)", url: "https://paystack.com/buy/the-7-star-teacher-ebook" },
    ],
  },
];

export const FEATURED_BOOK = LIBRARY_BOOKS.find((book) => book.featured)!;

export const LIBRARY_CATALOG = LIBRARY_BOOKS.filter((book) => !book.featured);

export const RESOURCE_SECTIONS = [
  {
    id: "marketplace-ministry",
    title: "Marketplace Ministry",
    bookCategory: "Marketplace Ministry",
    description:
      "Faith-driven leadership for believers shaping culture, law, government, and business.",
    bullets: ["Books and teaching series", "Conference keynotes", "Mentorship frameworks"],
  },
  {
    id: "high-performance",
    title: "High Performance",
    bookCategory: "High Performance",
    description:
      "Process, execution, and operational excellence for leaders under pressure.",
    bullets: ["Execution frameworks", "Networking and influence", "Process discipline"],
  },
  {
    id: "academic",
    title: "Academic Excellence",
    bookCategory: "Academic Excellence",
    description:
      "Resources for students, educators, and institutional leaders pursuing reform and rigour.",
    bullets: ["Educational leadership", "Institutional governance", "Youth development"],
  },
  {
    id: "audio",
    title: "Audio Archives",
    description:
      "Selected keynotes and conversations available for organisational learning and team development.",
    bullets: ["Keynote recordings", "Leadership conversations", "Teaching series"],
  },
] as const;

export function booksForResourceSection(sectionId: string): LibraryBook[] {
  const section = RESOURCE_SECTIONS.find((item) => item.id === sectionId);
  if (!section || !("bookCategory" in section)) return [];
  return LIBRARY_BOOKS.filter((book) => book.category === section.bookCategory);
}
