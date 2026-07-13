import {
  portfolio,
  type PortfolioProject,
} from "../../data/portfolio";
import type { DocumentBlock } from "./types";

export const formatProject = (project: PortfolioProject) =>
  [
    { type: "title", text: project.title },
    { type: "meta", label: "Year", value: project.year },
    { type: "meta", label: "Status", value: project.status },
    { type: "meta", label: "Role", value: project.role },
    ...(project.client
      ? [{ type: "meta" as const, label: "Client", value: project.client }]
      : []),
    ...(project.agency
      ? [{ type: "meta" as const, label: "Agency", value: project.agency }]
      : []),
    ...(project.period
      ? [{ type: "meta" as const, label: "Period", value: project.period }]
      : []),
    ...(project.availability
      ? [
          {
            type: "meta" as const,
            label: "Availability",
            value: project.availability,
          },
        ]
      : []),
    { type: "meta", label: "Stack", value: project.stack.join(", ") },
    { type: "paragraph", text: project.summary },
    ...(project.caseStudy
      ? [
          { type: "heading" as const, text: "Case Study" },
          {
            type: "meta" as const,
            label: "Problem",
            value: project.caseStudy.problem,
          },
          {
            type: "meta" as const,
            label: "Solution",
            value: project.caseStudy.solution,
          },
          ...(project.caseStudy.result
            ? [
                {
                  type: "meta" as const,
                  label: "Result",
                  value: project.caseStudy.result,
                },
              ]
            : []),
        ]
      : []),
    ...(project.responsibilities?.length
      ? [
          { type: "heading" as const, text: "Responsibilities" },
          { type: "list" as const, items: project.responsibilities },
        ]
      : []),
    ...(project.features?.length
      ? [
          { type: "heading" as const, text: "Features" },
          { type: "list" as const, items: project.features },
        ]
      : []),
    { type: "heading", text: "Highlights" },
    { type: "list", items: project.highlights },
    ...(project.metrics?.length
      ? [
          { type: "heading" as const, text: "Metrics" },
          {
            type: "list" as const,
            items: project.metrics.map((metric) =>
              [metric.label, metric.value, metric.note]
                .filter(Boolean)
                .join(" - "),
            ),
          },
        ]
      : []),
    ...(project.model
      ? [
          {
            type: "projectModel" as const,
            model: project.model,
          },
        ]
      : []),
    ...(project.accessNote
      ? [{ type: "paragraph" as const, text: project.accessNote }]
      : []),
    ...(project.images ?? []).map((image) => ({
      type: "image" as const,
      ...image,
    })),
    ...(project.links.length
      ? [
          { type: "heading" as const, text: "Links" },
          { type: "links" as const, items: project.links },
        ]
      : []),
  ] satisfies DocumentBlock[];

export const aboutContent = [
  { type: "title", text: "About Me" },
  { type: "meta", label: "Name", value: portfolio.profile.name },
  { type: "meta", label: "Role", value: portfolio.profile.role },
  { type: "meta", label: "Location", value: portfolio.profile.location },
  { type: "paragraph", text: portfolio.profile.summary },
  { type: "heading", text: "Focus" },
  { type: "list", items: portfolio.profile.focus },
  { type: "heading", text: "Achievements" },
  { type: "list", items: portfolio.achievements },
  { type: "heading", text: "Skills" },
  { type: "paragraph", text: portfolio.skills.join(", ") },
  { type: "heading", text: "Experience" },
  ...portfolio.experience.flatMap<DocumentBlock>((item) => [
    {
      type: "meta",
      label: item.company,
      value: `${item.role}, ${item.period}`,
    },
    { type: "list", items: item.highlights },
  ]),
] satisfies DocumentBlock[];

export const educationContent = [
  { type: "title", text: "Education" },
  ...portfolio.education.flatMap<DocumentBlock>((item) => [
    { type: "heading", text: item.place },
    { type: "meta", label: "Program", value: item.title },
    { type: "meta", label: "Period", value: item.period },
    { type: "paragraph", text: item.description },
  ]),
] satisfies DocumentBlock[];

export const contactsContent = [
  { type: "title", text: "Contact" },
  { type: "links", items: portfolio.contacts },
] satisfies DocumentBlock[];

export const timeMachineScreenshotContent = [
  {
    type: "image",
    src: "easter-eggs/screenshot_1988.png",
    alt: "A monochrome Macintosh desktop screenshot from 1988",
    caption: "Screenshot_1988.png",
  },
] satisfies DocumentBlock[];

export const futureProjectsContent = `Future Project Ideas

* Build software that feels physical
* Explore procedural art
* Make smaller things with more care`;

export const readmeFrom2035Content = `React 37 is finally stable.

CSS now has only 14 ways to center a div.

Most AI assistants spend their time helping people rename variables.

Somehow floppy disks are cool again.`;

export const lastDiskContent = `Every computer becomes a museum piece eventually.

Some are remembered because of their hardware.

Some because of their software.

The lucky ones are remembered because somebody loved them.

Thanks for visiting.`;

export const creditsContent = [
  { type: "title", text: "Credits & Licenses" },
  {
    type: "paragraph",
    text: "This portfolio is a personal, non-affiliated homage to early Macintosh interface culture. It combines original implementation work with credited references, fonts, icons, 3D assets, screenshots, and brand marks used to describe real projects.",
  },
  { type: "heading", text: "Apple Inspiration" },
  {
    type: "paragraph",
    text: "Special thanks to Apple and the designers of the original Macintosh, Finder, MacPaint, and System 6/System 7 interface language. The monochrome windows, menu bar, title stripes, pixel cursors, scrollbars, document metaphors, and interaction patterns in this site are built as a modern web tribute to that design era.",
  },
  {
    type: "paragraph",
    text: "This project is not affiliated with, endorsed by, or sponsored by Apple Inc. Apple, Macintosh, Finder, MacPaint, and related product names are trademarks of their respective owners.",
  },
  { type: "heading", text: "Design References" },
  {
    type: "list",
    items: [
      "Classic Macintosh UI Kit by Iftach: used as the primary visual reference for buttons, pop-up menus, window chrome, cursors, and classic Macintosh component proportions.",
      "Charlie Dean portfolio: credited as a contemporary portfolio reference and inspiration source.",
      "Gleb Solutions: credited as a contemporary web/portfolio reference and inspiration source.",
    ],
  },
  { type: "heading", text: "3D Models" },
  {
    type: "list",
    items: [
      "cartoon-teeth-set.glb: Cartoon Teeth Set from Get3DModels. Source lists author as poly by google and license as CC Attribution.",
      "open-wardrobe-closet.glb: Open Wardrobe Closet from Get3DModels. Source lists author as poly by google and license as CC Attribution.",
      "cap.glb: Low Poly Cap from Get3DModels. Source lists author as poly by google and license as CC Attribution.",
      "printer-scanner.glb: Office Printer from Get3DModels. Source lists author as Chenchanchong and license as CC Attribution.",
      "t-shirt.glb: local GLB contains mesh names based on Shirt_adid, but no reliable source/license metadata was found in the asset or public search results. Treat as source-to-verify before final production attribution, or replace with a model that has explicit license data.",
      "simplex.glb: Simplex project logo converted to GLB for case-study presentation. Treated as client/brand material used only to identify the commercial project.",
      "silkworm.glb: Silkworm project logo converted to GLB for case-study presentation. Treated as client/brand material used only to identify the commercial project.",
    ],
  },
  { type: "heading", text: "Fonts" },
  {
    type: "list",
    items: [
      "ChiKareGo2.ttf: pixel font by Giles Booth, based on the classic Macintosh Chicago direction by Susan Kare.",
      "FindersKeepers.ttf: font by Giles Booth, based on the 9pt Geneva/Finder label look documented by the author.",
      "Both fonts are used for the retro interface typography in this portfolio. If this project becomes commercial, keep the font source/license notes with the repository and replace any font whose redistribution status is unclear.",
    ],
  },
  { type: "heading", text: "Icons, Cursors, UI Assets" },
  {
    type: "list",
    items: [
      "Finder-style folder, file, app, contact, trash, and tool icons are custom SVG/pixel drawings created for this project or adapted from user-provided SVGs.",
      "VK, Telegram, Email, GitHub, trash, and Icon Painter icons were created/provided during the project and converted into the local 1-bit icon style.",
      "Cursor SVGs are local 1-bit recreations for arrow, hand, beam, grab, resize, pencil, precision, busy, and watch states.",
      "Happy Mac and Sad Mac style icons are used as nostalgic references to classic Macintosh system imagery, not as official Apple assets.",
    ],
  },
  { type: "heading", text: "Project Screenshots & Logos" },
  {
    type: "list",
    items: [
      "Project preview screenshots under /projects are used as portfolio case-study material for the author's own work.",
      "Simplex and Silkworm marks are used only as project identifiers inside their case studies.",
      "Generated Icon Painter, Dither Studio, and Badge Generator outputs are user-created assets stored locally in the browser.",
    ],
  },
  { type: "heading", text: "Open Source Runtime" },
  {
    type: "paragraph",
    text: "The site is built with React, TypeScript, Vite, Zustand, Three.js, React Three Fiber, Motion, QRCode, and related frontend tooling. Dependency licenses should be reviewed from package metadata before redistribution.",
  },
  { type: "heading", text: "Source Links" },
  {
    type: "links",
    items: [
      {
        label: "Classic Macintosh UI Kit by Iftach",
        href: "https://dribbble.com/shots/6102247-Classic-Macintosh-UI-Kit",
      },
      {
        label: "Classic Macintosh UI Kit product page",
        href: "https://gum.co/ClassicMacintoshUIKit",
      },
      {
        label: "Charlie Dean",
        href: "https://charliedean.com/portfolio",
      },
      {
        label: "Gleb Solutions",
        href: "https://gleb.solutions/",
      },
      {
        label: "Cartoon Teeth Set",
        href: "https://www.get3dmodels.com/anatomy/cartoon-teeth-set/",
      },
      {
        label: "Open Wardrobe Closet",
        href: "https://www.get3dmodels.com/fashion/open-wardrobe-closet/",
      },
      {
        label: "Low Poly Cap",
        href: "https://www.get3dmodels.com/fashion/low-poly-cap/",
      },
      {
        label: "Office Printer",
        href: "https://www.get3dmodels.com/architecture/office-printer/",
      },
      {
        label: "FindersKeepers by Giles Booth",
        href: "https://www.suppertime.co.uk/blogmywiki/2017/04/finderskeepers/",
      },
      {
        label: "ChiKareGo2 / FindersKeepers font mirror",
        href: "https://tilde.club/~georgemoody/fonts/",
      },
    ],
  },
] satisfies DocumentBlock[];
