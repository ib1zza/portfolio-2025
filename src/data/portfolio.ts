export interface PortfolioLink {
  label: string;
  href: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  year: string;
  status: string;
  role: string;
  stack: string[];
  summary: string;
  highlights: string[];
  links: PortfolioLink[];
  images?: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
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
      "Frontend developer focused on React, TypeScript, Vue, Nuxt, complex UI, animation, and performance-oriented interfaces.",
  },
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
        "Improve Lighthouse metrics to 90+ for Performance and Best Practices.",
        "Optimize page loading with SSR, lazy loading, dynamic imports, and Nuxt Image.",
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
  projects: [
    {
      id: "kanban",
      title: "Kanban",
      year: "2024",
      status: "Legacy portfolio project",
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
      highlights: [
        "Supports shared Kanban boards for multiple users.",
        "Uses Redux Toolkit for client state.",
        "Built with Feature-Sliced Design structure.",
        "Includes Storybook and Jest coverage.",
      ],
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
    {
      id: "realtime-chat",
      title: "Realtime Chat App",
      year: "2024",
      status: "Legacy portfolio project",
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
      highlights: [
        "Email and Google account authentication.",
        "Realtime message delivery through Firebase.",
        "File sending, chat deletion, profile editing, and app themes.",
        "Responsive layout for mobile and desktop screens.",
      ],
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
      id: "simplex",
      title: "Simplex",
      year: "2026",
      status: "New project",
      role: "Frontend developer",
      stack: ["Frontend", "Responsive UI", "Animation"],
      summary: "Website for a dental clinic with service pages and a polished appointment-oriented flow.",
      highlights: [
        "Commercial website direction.",
        "Healthcare-focused landing and service structure.",
        "Planned as a clean case study in the new portfolio.",
      ],
      links: [],
    },
    {
      id: "3d-outlet",
      title: "3D Outlet",
      year: "2026",
      status: "Current work",
      role: "Frontend developer",
      stack: ["Nuxt", "Vue", "Ecommerce", "Performance"],
      summary: "Online store for 3D printers and related products.",
      highlights: [
        "Current commercial ecommerce work.",
        "Product catalog and storefront experience.",
        "Good candidate for a detailed case study with performance and UX notes.",
      ],
      links: [],
    },
    {
      id: "silkworm",
      title: "Silkworm",
      year: "2026",
      status: "Commercial project",
      role: "Frontend developer",
      stack: ["Ecommerce", "Catalog", "Cart", "Responsive UI"],
      summary: "Clothing ecommerce website with catalog, gallery, cart, product pages, and delivery information.",
      highlights: [
        "Public production website for a clothing brand.",
        "Minimal black-and-white visual system that fits the new 1-bit portfolio direction.",
        "Includes catalog, gallery, cart, offer, payment, and delivery pages.",
      ],
      links: [{ label: "Live", href: "https://xn--b1algdhloc.xn--p1ai/" }],
      images: [
        {
          src: "/projects/silkworm/preview.png",
          alt: "Silkworm website home screen",
          caption: "Production website reference",
        },
      ],
    },
  ] satisfies PortfolioProject[],
};
