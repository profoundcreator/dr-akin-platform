import { SITE_IMAGES } from "@/lib/media/site-images";
import { contactPathForPlatform } from "@/lib/contact/platform-context";
import { AU_TITLE, PUBLIC_NAME } from "@/data/person-identity";

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
    title: `Work — ${PUBLIC_NAME}`,
    kicker: "Governance · Enterprise · Education",
    headline: "Three strategic pillars. Six platforms.",
    headlineSecondary: "One commitment to Africa’s progress.",
    description:
      "Akin Akinpelu’s work connects public leadership, enterprise development and education. Each platform addresses a distinct part of the same challenge: building capable institutions, productive people and partnerships that can sustain Africa’s growth.",
    sections: [
      {
        title: "One connected ecosystem",
        body: "Across governance, enterprise and education, six platforms strengthen institutions, expand opportunity and turn Africa’s ambitions into durable systems.",
      },
    ],
    relatedLinks: [
      { label: AU_TITLE, href: "/meet-akin/au-ambassador" },
      { label: "Future Africa", href: "/work/future-africa" },
      { label: "AALD", href: "/work/aald" },
      { label: "PERFORMX", href: "/work/performx" },
      { label: "Erudio Hub", href: "/work/erudio-hub" },
      { label: "Auctus Africa", href: "/work/auctus-africa" },
    ],
    cta: { label: "Discuss a partnership", href: "/book-dr-akin" },
  },
  "work-future-africa": {
    slug: "work/future-africa",
    title: "Future Africa — Governance and Continental Collaboration",
    kicker: "Governance · Continental collaboration",
    headline: "Reimagining Africa’s future—",
    headlineSecondary: "one institution, economy and life at a time.",
    description:
      "Future Africa is a continental platform designed to accelerate the aspirations of Agenda 2063 through collaboration, leadership and strategic action. It brings governments, development institutions, academia, business, civil society, traditional institutions, the African diaspora and citizens into a shared platform for implementation.",
    sections: [
      {
        title: "From aspiration to coordinated action",
        body: "Africa’s opportunity is matched by the scale of the work required. Future Africa exists to strengthen and connect existing efforts—not to create parallel structures—by cultivating ethical leadership, investing in human capital and building partnerships across sectors and borders.",
      },
      {
        title: "Flagship initiatives",
        body: "Planned initiatives are designed to connect public leadership, institutional collaboration and citizen participation around practical implementation.",
        bullets: [
          "Government Partnerships & Institutional Collaboration",
          "Future Africa School of Governance",
          "Future Africa Ambassadors Network",
          "Future Africa Festival",
          "Youth Leadership & Human Capital Development",
        ],
      },
      {
        title: "A platform for implementation",
        body: "Future Africa mobilises today’s institutions and citizens through collaboration, leadership and strategic action to help build the Africa of tomorrow.",
      },
    ],
    cta: { label: "Discuss a partnership", href: "/book-dr-akin" },
  },
  "work-aald": {
    slug: "work/aald",
    title: "AALD — Learning & Development for African Enterprise",
    kicker: "Enterprise · Consulting · Training · Research",
    headline: "Building stronger African organisations—",
    headlineSecondary: "through consulting, training and research.",
    description:
      "Akin Akinpelu Learning & Development Company partners with corporates across Africa and African institutions in the diaspora to strengthen leadership, sharpen strategy and build cultures that perform at scale.",
    sections: [
      {
        title: "What we do",
        body: "AALD delivers innovative consulting, executive training and applied research for organisations building across the continent and beyond.",
        bullets: [
          "Strategic consulting and organisational diagnostics",
          "Executive training and leadership development",
          "Applied research and capability building",
          "Culture, performance and transformation support",
        ],
      },
      {
        title: "Who we serve",
        body: "We work with African corporates, public institutions, NGOs and diaspora organisations that need practical leadership and performance systems—not generic playbooks.",
        bullets: [
          "Corporate leadership teams and boards",
          "Public-sector and institutional leaders",
          "NGOs and social-impact organisations",
          "African institutions in the global diaspora",
        ],
      },
      {
        title: "Why AALD",
        body: "Founded and led by Akin Akinpelu, Ph.D., Amb., FLPi, AALD combines continental perspective with disciplined execution—helping organisations turn ambition into measurable performance.",
        bullets: [
          "Continental reach across 20+ countries",
          "1,000,000+ people reached through leadership work",
          "26+ years of institutional leadership experience",
          "Research-backed consulting and training methodologies",
        ],
      },
      {
        title: "Part of a broader ecosystem",
        body: "AALD sits within the Enterprise pillar alongside PerformX Nexus—connecting organisational development with high-performance leadership convenings.",
        bullets: [
          "PerformX Nexus catalytic ecosystem",
          "PerformX Summit 2026",
        ],
      },
    ],
    cta: { label: "Invite Akin Akinpelu to speak", href: "/meet-akin/speaking" },
    secondaryCta: { label: "Discuss a partnership", href: contactPathForPlatform("aald") },
    relatedLinks: [
      { label: "PerformX Nexus", href: "/work/performx" },
      { label: "PerformX Summit 2026", href: "/events/performx-summit-2026" },
    ],
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
    title: "PerformX Nexus — The Catalytic Ecosystem",
    kicker: "PerformX Nexus · Enterprise",
    headline: "Building bold.",
    headlineSecondary: "Executing smart. Performing beyond.",
    description:
      "PerformX Nexus is a catalytic ecosystem where leaders, institutions and sectors converge to turn strategy into disciplined execution and measurable impact.",
    sections: [
      {
        title: "Three pillars",
        body: "PerformX Nexus integrates convening, advisory council work and impact programmes into one ecosystem.",
        bullets: [
          "PerformX Summit — flagship leadership convening (delegates, speakers, sponsors)",
          "Horizon Council — strategic advisory circle for sector and institutional leaders",
          "Impact Core — programmes that translate summit insights into sustained organisational performance",
        ],
      },
      {
        title: "Who it serves",
        body: "PerformX Nexus is designed for leaders and institutions ready to move from ambition to accountable execution.",
        bullets: [
          "C-suite and senior operating leaders",
          "Boards and institutional governing bodies",
          "Sector conveners across eight strategic sectors",
          "Partners seeking catalytic sponsorship and collaboration",
        ],
      },
      {
        title: "PerformX Summit 2026",
        body: "The next edition convenes 20–21 November 2026 at Landmark Event Centre, Lagos, under the theme Leading Frontiers: Innovate, Integrate, Impact.",
        bullets: [
          "Eight sectors · Power Room sessions · Nexus Honors",
          "Delegate, speaker and partnership pathways",
        ],
      },
      {
        title: "Partnerships",
        body: "Sector ownership and sponsorship packages are available on request. Public pages do not list pricing—start a conversation with the team.",
        bullets: [
          "Request partnership deck via contact",
          "Parent brand: AALD",
        ],
      },
    ],
    cta: { label: "Book an advisory session", href: "/book-dr-akin" },
    secondaryCta: { label: "Register interest in the summit", href: "/events/performx-summit-2026" },
    relatedLinks: [
      { label: "PerformX Summit 2026", href: "/events/performx-summit-2026" },
      { label: "AALD", href: "/work/aald" },
    ],
  },
  "work-auctus-africa": {
    slug: "work/auctus-africa",
    title: "Auctus Africa — Education and Social Transformation",
    kicker: "Education · Social transformation",
    headline: "Turning potential into opportunity",
    headlineSecondary: "across African communities.",
    description:
      "Auctus Social Transformation Initiative is a non-profit organisation committed to bridging the gap between potential and opportunity through education, empowerment, environmental responsibility and pathways to economic participation.",
    sections: [
      {
        title: "Human capital for community transformation",
        body: "Auctus Africa works with learners, educators, institutions and communities to strengthen capacity and widen access to the knowledge, skills and partnerships people need to thrive.",
      },
      {
        title: "Programme highlights",
        body: "Its programmes connect educator development, youth opportunity and practical pathways into education, enterprise and skilled work.",
        bullets: [
          "The 7 Star Programme for teacher and educator development",
          "Youth empowerment and 21st-century skills",
          "Graduate pathways into education",
          "Technical, vocational and entrepreneurship initiatives",
        ],
      },
    ],
    cta: { label: "Visit Auctus Africa", href: "https://auctusafrica.org/" },
    secondaryCta: { label: "Explore the education pillar", href: "/work" },
  },
  "meet-akin": {
    slug: "meet-akin",
    title: `Meet ${PUBLIC_NAME}`,
    kicker: "Governance · Enterprise · Education",
    headline: "Leadership for institutions.",
    headlineSecondary: "Partnership for Africa’s future.",
    description:
      `${PUBLIC_NAME} is a leadership scholar, governance practitioner, diplomat and institution builder working across governance, enterprise and education.`,
    sections: [
      {
        title: "Three strategic pillars",
        body: "His work connects public leadership, enterprise development and education with a single through-line: building capable institutions and developing transformational leaders.",
      },
    ],
    cta: { label: "Inquire for advisory", href: "/meet-akin/speaking" },
  },
  "meet-profile": {
    slug: "meet-akin/profile",
    title: `Profile — ${PUBLIC_NAME}`,
    kicker: "Profile · Biography & credentials",
    headline: "Biography and credentials",
    description:
      `${PUBLIC_NAME} is a leadership scholar, governance practitioner, diplomat and institution builder advancing Africa’s long-term transformation.`,
    sections: [
      {
        title: "Background",
        body: "A sought-after advisor to C-suite leaders, boards, and institutions, Akin Akinpelu has authored multiple books on leadership, execution, and institutional transformation.",
        bullets: [
          "Executive coach and corporate strategist",
          "Author of nine published titles",
          "Founder, Akin Akinpelu Learning & Development Company (AALD)",
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
      `${PUBLIC_NAME} serves as ${AU_TITLE}, contributing to continental engagement around governance, institutional capacity, leadership and strategic partnerships.`,
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
    title: `Board Governance — ${PUBLIC_NAME}`,
    kicker: "Board Governance · Advisory",
    headline: "Boards, advisory roles, and",
    headlineSecondary: "governance excellence.",
    description:
      "Akin Akinpelu advises boards and governance bodies on leadership transitions, fiduciary responsibility, and long-term institutional stewardship.",
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
    title: `Keynote Speaking — ${PUBLIC_NAME}`,
    kicker:
      `${PUBLIC_NAME} · Keynote Speaker`,
    headline: "A speaker who moves rooms",
    headlineSecondary: "from the main stage to the boardroom.",
    description:
      `${PUBLIC_NAME} delivers keynotes, panel contributions, workshops and fireside conversations across governance, enterprise and education.`,
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
    cta: { label: "Invite Akin Akinpelu", href: "/book-dr-akin" },
    secondaryCta: { label: "About Akin", href: "/meet-akin/profile" },
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
        body: "Akin Akinpelu's published works distil decades of coaching and consulting into actionable frameworks.",
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
      "Organizer packs are not public downloads. Approved materials are released only to individual bookings through their secure, token-protected tracking link.",
    sections: [
      {
        title: "Available materials",
        body: "After the team approves access, your booking tracker will show the current materials assigned to your engagement. Each download uses a short-lived private link.",
        bullets: [
          "Biography (short, medium, full)",
          "Official headshots and photographs",
          "Preferred introduction script",
          "AV and technical requirements",
        ],
      },
    ],
    cta: { label: "Submit a booking request", href: "/book-dr-akin" },
    relatedLinks: [{ label: "Contact the team", href: "/contact" }],
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
    cover: SITE_IMAGES.books["the-seven-star-student"],
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
    cover: SITE_IMAGES.books["the-seven-star-teacher"],
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
