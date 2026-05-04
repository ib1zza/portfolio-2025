export interface PortfolioLink {
  label: string;
  href: string;
}

export type ProjectKind =
  | "commercial"
  | "pet"
  | "legacy"
  | "current"
  | "internal";

export type ProjectAvailability =
  | "public"
  | "private"
  | "offline"
  | "unreleased"
  | "nda";

export interface ProjectMetric {
  label: string;
  value: string;
  note?: string;
}

export interface CaseStudyBlock {
  problem: string;
  solution: string;
  result?: string;
}

export interface ProjectModel {
  kind: "tooth" | "shirt" | "printer" | "chat-bubble" | "kanban-board";
  label: string;
  src?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  extras?: Array<{
    src: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
  }>;
  logo?: {
    src: string;
    scale?: number;
    position?: [number, number, number];
    rotationSpeed?: number;
  };
}

export interface PortfolioProject {
  id: string;
  title: string;
  year: string;
  status: string;
  role: string;
  stack: string[];
  summary: string;
  kind?: ProjectKind;
  availability?: ProjectAvailability;
  featured?: boolean;
  priority?: number;
  client?: string;
  agency?: string;
  period?: string;
  responsibilities?: string[];
  features?: string[];
  highlights: string[];
  metrics?: ProjectMetric[];
  caseStudy?: CaseStudyBlock;
  accessNote?: string;
  model?: ProjectModel;
  links: PortfolioLink[];
  images?: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}

export interface ProjectSection {
  id: string;
  title: string;
  description: string;
  projectIds: string[];
}

export interface EducationItem {
  id: string;
  title: string;
  place: string;
  period: string;
  description: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  period: string;
  role: string;
  highlights: string[];
}

export const portfolio = {
  profile: {
    name: "Mikhail Pshenichny",
    role: "Frontend developer",
    location: "Saint Petersburg, Russia",
    summary:
      "Frontend developer with commercial experience in Nuxt, Vue, React, and TypeScript. I build responsive interfaces, reusable UI kits, animation-rich pages, and performance-oriented production websites.",
    focus: [
      "Commercial Nuxt/Vue websites",
      "React + TypeScript applications",
      "Reusable UI kits",
      "Interface animation",
      "Lighthouse and frontend performance",
    ],
  },
  focusAreas: [
    "Nuxt/Vue production websites",
    "React + TypeScript applications",
    "UI kit development",
    "Animation and transitions",
    "Frontend performance optimization",
  ],
  achievements: [
    "Built reusable UI kits for faster and more consistent page development.",
    "Worked on production ecommerce and service websites in a studio environment.",
    "Improved Lighthouse-oriented metrics through lazy loading, media optimization, SSR practices, and component-level performance work.",
  ],
  contacts: [
    { label: "Telegram", href: "https://t.me/ib1zza" },
    { label: "GitHub", href: "https://github.com/ib1zza" },
    { label: "Email", href: "mailto:dremast1337@gmail.com" },
  ],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Redux Toolkit",
    "RTK Query",
    "Vue",
    "Nuxt",
    "Pinia",
    "SCSS",
    "CSS Modules",
    "Motion",
    "Storybook",
    "Jest",
    "Cypress",
    "Vite",
    "Webpack",
    "Firebase",
    "i18next",
    "Git",
  ],
  experience: [
    {
      id: "grokhotov-studio",
      company: "GROKHOTOV STUDIO",
      period: "Sep 2025 - Present",
      role: "Nuxt developer",
      highlights: [
        "Build interactive interfaces with Vue 3, Composition API, and Nuxt 4.",
        "Implement complex UI components, Swiper interactions, custom transitions, and scroll animations.",
        "Improve Lighthouse metrics through SSR, lazy loading, dynamic imports, and asset optimization.",
        "Work on reusable UI kits, commercial pages, code review, and production delivery.",
      ],
    },
    {
      id: "apex-nova-tech",
      company: "ApexNovaTech",
      period: "Jan 2025 - Aug 2025",
      role: "React + TypeScript developer",
      highlights: [
        "Implemented profile and recommendations UI.",
        "Built interface animations with Motion.",
        "Worked closely with UX/UI designers and backend developers on API integration.",
        "Refactored legacy code and participated in code review.",
      ],
    },
  ] satisfies ExperienceItem[],
  education: [
    {
      id: "spbpu-ispo",
      title: "Information technologies and programming",
      place: "ISPO at SPbPU",
      period: "2021 - 2025",
      description: "Secondary vocational education.",
    },
    {
      id: "top-academy",
      title: "WEB project development and promotion",
      place: "Computer Academy TOP",
      period: "2022 - 2023",
      description:
        "Additional education focused on JavaScript, React, TypeScript, CSS, HTML, and web development.",
    },
  ] satisfies EducationItem[],
  projectSections: [
    {
      id: "featured",
      title: "Featured Projects",
      description: "Commercial and production-ready projects.",
      projectIds: ["simplex", "silkworm", "3d-outlet"],
    },
    {
      id: "legacy",
      title: "Legacy Projects",
      description:
        "Older projects that show React, Firebase, testing, and architecture practice.",
      projectIds: ["realtime-chat", "kanban"],
    },
  ] satisfies ProjectSection[],
  projects: [
    {
      id: "simplex",
      title: "Simplex Clinic",
      year: "2026",
      status: "Commercial production project",
      kind: "commercial",
      availability: "public",
      featured: true,
      priority: 1,
      client: "Simplex Clinic",
      agency: "GROKHOTOV STUDIO",
      period: "2025 - 2026",
      role: "Frontend developer",
      stack: [
        "Nuxt 4",
        "Vue 3",
        "TypeScript",
        "Pinia",
        "Sass",
        "Motion",
        "nuxt-swiper",
        "Maska",
        "ESLint",
        "Prettier",
      ],
      summary:
        "Production website for a dental clinic with service pages, appointment-oriented user flow, responsive layouts, animations, and performance-focused Nuxt implementation.",
      responsibilities: [
        "Developed responsive Nuxt pages and reusable layout sections.",
        "Built and maintained a project UI kit: buttons, inputs, cards, typography, section primitives, and reusable interface blocks.",
        "Implemented animation logic, scroll-based interactions, page transitions, and slider interactions.",
        "Worked on frontend logic for interactive blocks and form-related UI.",
        "Optimized Lighthouse-oriented performance through lazy loading, media optimization, and Nuxt rendering practices.",
        "Adapted layouts for desktop, tablet, and mobile breakpoints.",
      ],
      features: [
        "Service-oriented website structure.",
        "Appointment-focused user journey.",
        "Responsive commercial landing and inner pages.",
        "Animated interface sections.",
        "Reusable UI components.",
      ],
      highlights: [
        "Built a scalable UI kit for consistent page development.",
        "Implemented polished animations without hurting page usability.",
        "Improved Lighthouse-oriented performance and best-practice metrics.",
        "Delivered commercial production UI on Nuxt and Vue.",
      ],
      metrics: [
        {
          label: "Lighthouse",
          value: "Optimized",
          note: "Exact scores can be added after a dated production measurement.",
        },
      ],
      caseStudy: {
        problem:
          "The project needed a polished commercial website for a premium dental clinic with a clean visual system, responsive pages, and smooth interaction details.",
        solution:
          "I implemented reusable Nuxt/Vue UI components, built the UI kit, added animation and slider interactions, and optimized the frontend for Lighthouse-oriented metrics.",
        result:
          "The project became a production-ready clinic website with reusable components, responsive layouts, and performance-focused implementation.",
      },
      model: {
        kind: "tooth",
        label: "Interactive 1-bit dental model",
        src: "/models/cartoon-teeth-set.glb",
        scale: 1.85,
        position: [0, -0.3, 0],
        rotation: [0, -Math.PI / 2, 0],
        logo: {
          src: "/models/simplex.glb",
          scale: 1.05,
          position: [0, 0.95, 0],
          rotationSpeed: 0.7,
        },
      },
      links: [{ label: "Live", href: "https://simplexclinic.ru/" }],
    },
    {
      id: "silkworm",
      title: "Silkworm",
      year: "2026",
      status: "Commercial production project",
      kind: "commercial",
      availability: "public",
      featured: true,
      priority: 2,
      client: "Silkworm",
      role: "Frontend developer",
      stack: ["Ecommerce", "Catalog", "Cart", "Responsive UI"],
      summary:
        "Clothing ecommerce website with catalog, gallery, cart, product pages, and delivery information.",
      responsibilities: [
        "Built responsive ecommerce pages and reusable product interface blocks.",
        "Worked on catalog, product, cart, payment, and delivery flows.",
        "Adapted the interface for mobile and desktop commerce scenarios.",
        "Maintained a restrained black-and-white visual system across pages.",
      ],
      features: [
        "Product catalog.",
        "Product pages.",
        "Cart flow.",
        "Delivery and payment pages.",
        "Gallery and brand content.",
      ],
      highlights: [
        "Public production website for a clothing brand.",
        "Minimal black-and-white visual system that fits the new 1-bit portfolio direction.",
        "Includes catalog, gallery, cart, offer, payment, and delivery pages.",
      ],
      caseStudy: {
        problem:
          "The project needed a public ecommerce experience with a clear product journey and a minimal visual direction.",
        solution:
          "I worked on responsive ecommerce UI, product-facing pages, cart-related interface pieces, and consistent visual presentation.",
        result:
          "The website presents the brand and product catalog through a production ecommerce flow.",
      },
      model: {
        kind: "shirt",
        label: "Interactive 1-bit clothing model",
        src: "/models/t-shirt.glb",
        scale: 1.2,
        position: [-0.4, -0.4, 0],
        rotation: [0, Math.PI, 0],
        extras: [
          {
            src: "/models/cap.glb",
            scale: 0.65,
            position: [0.72, -0.42, 0],
          },
        ],
        logo: {
          src: "/models/silkworm.glb",
          scale: 0.75,
          position: [0, 0.8, 0],
          rotationSpeed: 0.65,
        },
      },
      links: [{ label: "Live", href: "https://xn--b1algdhloc.xn--p1ai/" }],
      images: [
        {
          src: "/projects/silkworm/preview.png",
          alt: "Silkworm website home screen",
          caption: "Production website reference",
        },
      ],
    },
    {
      id: "3d-outlet",
      title: "3D Outlet",
      year: "2026",
      status: "Current commercial ecommerce work",
      kind: "current",
      availability: "private",
      featured: true,
      priority: 3,
      role: "Frontend developer",
      stack: ["Nuxt", "Vue", "TypeScript", "Ecommerce", "Performance"],
      summary:
        "Current commercial ecommerce work for an online store focused on 3D printers and related products.",
      responsibilities: [
        "Develop responsive ecommerce pages and reusable storefront components.",
        "Work on product catalog UI, product presentation, and commerce-oriented page sections.",
        "Improve frontend performance and loading behavior in a Nuxt environment.",
      ],
      features: [
        "Product catalog.",
        "Storefront pages.",
        "Commercial product presentation.",
        "Responsive ecommerce UI.",
      ],
      highlights: [
        "Current production-oriented ecommerce work.",
        "Good candidate for a detailed case study with screenshots and performance notes.",
        "Private case study until public materials are ready.",
      ],
      accessNote:
        "Live link and source code are unavailable. Case study can be expanded with sanitized screenshots later.",
      model: {
        kind: "printer",
        label: "Interactive 1-bit printer model",
        src: "/models/printer-scanner.glb",
        scale: 2.2,
      },
      links: [],
    },
    {
      id: "realtime-chat",
      title: "Realtime Chat App",
      year: "2024",
      status: "Legacy portfolio project",
      kind: "pet",
      availability: "public",
      featured: false,
      priority: 4,
      role: "Frontend developer",
      stack: [
        "React",
        "TypeScript",
        "SCSS",
        "Firebase",
        "Redux Toolkit",
        "Motion",
        "Vite",
        "i18next",
        "date-fns",
      ],
      summary:
        "Realtime messaging app with auth, user search, messages, files, profile editing, themes, and localization.",
      responsibilities: [
        "Implemented realtime chat UI and Firebase data flow.",
        "Built authentication, profile editing, user search, themes, and localization.",
        "Added file sending and responsive layouts for mobile and desktop.",
      ],
      features: [
        "Email and Google authentication.",
        "Realtime messages.",
        "File sending.",
        "Profile editing.",
        "Themes and localization.",
      ],
      highlights: [
        "Email and Google account authentication.",
        "Realtime message delivery through Firebase.",
        "File sending, chat deletion, profile editing, and app themes.",
        "Responsive layout for mobile and desktop screens.",
      ],
      model: { kind: "chat-bubble", label: "Interactive 1-bit chat model" },
      links: [
        { label: "Live", href: "https://react-chat-dusky.vercel.app" },
        { label: "GitHub", href: "https://github.com/ib1zza/react-chat" },
      ],
      images: [
        {
          src: "/projects/realtime-chat/preview.png",
          alt: "Realtime chat interface",
          caption: "Chat screen preview",
        },
      ],
    },
    {
      id: "kanban",
      title: "Kanban",
      year: "2024",
      status: "Legacy portfolio project",
      kind: "legacy",
      availability: "public",
      featured: false,
      priority: 5,
      role: "Frontend developer",
      stack: [
        "React",
        "TypeScript",
        "SCSS",
        "Redux Toolkit",
        "Firebase",
        "i18next",
        "Jest",
        "Storybook",
      ],
      summary:
        "Collaborative Kanban board app with realtime board data powered by Firebase Realtime Database.",
      responsibilities: [
        "Built a collaborative board UI with reusable React components.",
        "Structured the project using Feature-Sliced Design.",
        "Added Storybook stories and Jest coverage for core UI pieces.",
      ],
      features: [
        "Shared Kanban boards.",
        "Realtime Firebase data.",
        "Redux Toolkit state management.",
        "Storybook component documentation.",
      ],
      highlights: [
        "Supports shared Kanban boards for multiple users.",
        "Uses Redux Toolkit for client state.",
        "Built with Feature-Sliced Design structure.",
        "Includes Storybook and Jest coverage.",
      ],
      model: { kind: "kanban-board", label: "Interactive 1-bit Kanban model" },
      links: [
        { label: "Live", href: "https://react-kanban-delta.vercel.app/" },
        { label: "GitHub", href: "https://github.com/ib1zza/react-kanban" },
      ],
      images: [
        {
          src: "/projects/kanban/preview.png",
          alt: "Kanban application interface",
          caption: "Board interface preview",
        },
      ],
    },
  ] satisfies PortfolioProject[],
};
