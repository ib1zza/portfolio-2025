import { portfolio, type PortfolioLink } from "../../data/portfolio";

export type AssistantLanguage = "en";

export interface PortfolioSearchHit {
  kind: "profile" | "experience" | "project" | "skills";
  id: string;
  title: string;
  score: number;
  matchedFields: string[];
  summary: string;
  links: PortfolioLink[];
  details: string[];
}

export interface AssistantAnswer {
  language: AssistantLanguage;
  text: string;
  hits: PortfolioSearchHit[];
  suggestedQuestions: string[];
}

export interface AssistantProviderInput {
  question: string;
  language: AssistantLanguage;
  hits: PortfolioSearchHit[];
  portfolioContext: typeof portfolio;
}

export interface AssistantProvider {
  generateAnswer: (input: AssistantProviderInput) => Promise<AssistantAnswer>;
}

interface SearchField {
  name: string;
  text: string;
  weight: number;
}

interface SearchDocument {
  kind: PortfolioSearchHit["kind"];
  id: string;
  title: string;
  summary: string;
  fields: SearchField[];
  links: PortfolioLink[];
  details: string[];
}

const SUGGESTIONS = [
  "Commercial Vue experience",
  "Projects with Firebase",
  "What did you do in Simplex",
];

const TOKEN_ALIASES: Record<string, string[]> = {
  "3d": ["3d-outlet", "printer", "ecommerce"],
  ai: ["assistant", "search", "finder"],
  api: ["integration", "frontend", "backend"],
  chat: ["realtime-chat", "messages", "firebase"],
  commercial: ["production", "client", "agency", "ecommerce", "nuxt", "vue"],
  ecommerce: ["store", "catalog", "cart", "payment", "delivery"],
  firebase: ["realtime", "auth", "database", "chat", "kanban"],
  grokhotov: ["agency", "commercial", "nuxt", "vue"],
  nuxt: ["vue", "commercial", "ssr"],
  react: ["typescript", "redux", "vite"],
  simplex: ["clinic", "dental", "nuxt", "vue", "commercial"],
  vue: ["nuxt", "commercial", "composition"],
  vue3: ["vue", "nuxt"],
};

export const sanitizeAssistantQuestion = (value: string) =>
  value.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ");

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string) =>
  normalize(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const expandTokens = (tokens: string[]) =>
  unique(tokens.flatMap((token) => [token, ...(TOKEN_ALIASES[token] ?? [])]));

const joinText = (items: Array<string | undefined>) =>
  items.filter(Boolean).join(" ");

const searchDocuments: SearchDocument[] = [
  {
    kind: "profile",
    id: "profile",
    title: portfolio.profile.name,
    summary: portfolio.profile.summary,
    links: portfolio.contacts,
    details: [...portfolio.profile.focus, ...portfolio.achievements],
    fields: [
      {
        name: "profile",
        text: joinText([
          portfolio.profile.name,
          portfolio.profile.role,
          portfolio.profile.location,
          portfolio.profile.summary,
        ]),
        weight: 4,
      },
      {
        name: "focus",
        text: portfolio.profile.focus.join(" "),
        weight: 3,
      },
      {
        name: "achievements",
        text: portfolio.achievements.join(" "),
        weight: 2,
      },
    ],
  },
  {
    kind: "skills",
    id: "skills",
    title: "Skills",
    summary: portfolio.skills.join(", "),
    links: portfolio.contacts,
    details: portfolio.focusAreas,
    fields: [
      {
        name: "skills",
        text: portfolio.skills.join(" "),
        weight: 5,
      },
      {
        name: "focus",
        text: portfolio.focusAreas.join(" "),
        weight: 3,
      },
    ],
  },
  ...portfolio.experience.map<SearchDocument>((item) => ({
    kind: "experience",
    id: item.id,
    title: item.company,
    summary: `${item.role}, ${item.period}`,
    links: portfolio.contacts,
    details: item.highlights,
    fields: [
      {
        name: "company",
        text: item.company,
        weight: 7,
      },
      {
        name: "role",
        text: item.role,
        weight: 5,
      },
      {
        name: "period",
        text: item.period,
        weight: 2,
      },
      {
        name: "highlights",
        text: item.highlights.join(" "),
        weight: 3,
      },
    ],
  })),
  ...portfolio.projects.map<SearchDocument>((project) => ({
    kind: "project",
    id: project.id,
    title: project.title,
    summary: project.summary,
    links: project.links,
    details: [
      ...(project.responsibilities ?? []),
      ...(project.features ?? []),
      ...project.highlights,
      project.caseStudy?.problem,
      project.caseStudy?.solution,
      project.caseStudy?.result,
      project.accessNote,
    ].filter((item): item is string => Boolean(item)),
    fields: [
      {
        name: "title",
        text: joinText([project.title, project.id, project.client]),
        weight: 8,
      },
      {
        name: "stack",
        text: project.stack.join(" "),
        weight: 6,
      },
      {
        name: "status",
        text: joinText([
          project.status,
          project.kind,
          project.availability,
          project.agency,
          project.client,
          project.period,
          project.role,
        ]),
        weight: 4,
      },
      {
        name: "summary",
        text: project.summary,
        weight: 3,
      },
      {
        name: "responsibilities",
        text: project.responsibilities?.join(" ") ?? "",
        weight: 3,
      },
      {
        name: "features",
        text: project.features?.join(" ") ?? "",
        weight: 2,
      },
      {
        name: "case study",
        text: joinText([
          project.caseStudy?.problem,
          project.caseStudy?.solution,
          project.caseStudy?.result,
        ]),
        weight: 2,
      },
    ],
  })),
];

const scoreField = (field: SearchField, exactQuery: string, tokens: string[]) => {
  const text = normalize(field.text);
  if (!text) return 0;

  const exactScore =
    exactQuery.length > 2 && text.includes(exactQuery) ? field.weight * 8 : 0;
  const tokenScore = tokens.reduce((score, token) => {
    if (text === token) return score + field.weight * 4;
    if (text.includes(token)) return score + field.weight;
    return score;
  }, 0);

  return exactScore + tokenScore;
};

export const searchPortfolio = (question: string): AssistantAnswer => {
  const language: AssistantLanguage = "en";
  const cleanQuestion = sanitizeAssistantQuestion(question);
  const normalizedQuestion = normalize(cleanQuestion);
  const questionTokens = tokenize(cleanQuestion);
  const expandedTokens = expandTokens(questionTokens);

  if (!expandedTokens.length) {
    return {
      language,
      text: "Ask about the stack, commercial experience, a specific project, or a company.",
      hits: [],
      suggestedQuestions: SUGGESTIONS,
    };
  }

  const scoredHits = searchDocuments
    .map((document) => {
      const fieldScores = document.fields.map((field) => ({
        name: field.name,
        score: scoreField(field, normalizedQuestion, expandedTokens),
      }));
      const score = fieldScores.reduce((total, field) => total + field.score, 0);

      return {
        kind: document.kind,
        id: document.id,
        title: document.title,
        score,
        matchedFields: fieldScores
          .filter((field) => field.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((field) => field.name),
        summary: document.summary,
        links: document.links,
        details: document.details,
      } satisfies PortfolioSearchHit;
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 6);
  const hasProjectIntent = questionTokens.some((token) =>
    ["project", "projects"].includes(token),
  );
  const isSimplexQuery = normalizedQuestion.includes("simplex");
  const isFirebaseProjectQuery =
    normalizedQuestion.includes("firebase") && hasProjectIntent;
  const entityHits = isSimplexQuery
    ? scoredHits.filter(
        (hit) =>
          normalize(hit.id).includes("simplex") ||
          normalize(hit.title).includes("simplex"),
      )
    : isFirebaseProjectQuery
      ? scoredHits.filter((hit) => hit.kind === "project")
      : [];
  const hits = entityHits.length ? entityHits : scoredHits;

  return {
    language,
    text: composeLocalAnswer(cleanQuestion, hits),
    hits,
    suggestedQuestions: SUGGESTIONS,
  };
};

const formatHitList = (hits: PortfolioSearchHit[]) =>
  hits
    .slice(0, 4)
    .map((hit) => {
      const detail = hit.details[0] ? ` ${hit.details[0]}` : "";
      const summary = hit.summary.replace(/[.\s]+$/, "");

      return `${hit.title}: ${summary}.${detail}`;
    })
    .join("\n");

const composeLocalAnswer = (question: string, hits: PortfolioSearchHit[]) => {
  if (!hits.length) {
    return "I did not find a close match in the portfolio data. Try asking about Vue, Nuxt, Firebase, Simplex, ecommerce, or commercial experience.";
  }

  const normalizedQuestion = normalize(question);
  const topHits = formatHitList(hits);
  const hasFirebase = normalizedQuestion.includes("firebase");
  const hasSimplex = normalizedQuestion.includes("simplex");
  const hasCommercial =
    normalizedQuestion.includes("commercial") ||
    normalizedQuestion.includes("vue") ||
    normalizedQuestion.includes("nuxt");

  if (hasSimplex) {
    return `For Simplex, this was a commercial production Nuxt 4, Vue 3, and TypeScript dental clinic website. The work included a UI kit, responsive pages, animations, sliders, form-related UI, and Lighthouse-oriented performance.\n${topHits}`;
  }

  if (hasFirebase) {
    return `Firebase appears in the legacy React projects: Realtime Chat App and Kanban. They cover realtime data and auth flows, Redux Toolkit, and responsive app UI.\n${topHits}`;
  }

  if (hasCommercial) {
    return `The commercial Vue and Nuxt experience is tied to GROKHOTOV STUDIO and production projects such as Simplex Clinic, Silkworm, and current 3D Outlet work. The focus is Nuxt and Vue pages, reusable UI kits, animation, ecommerce UI, and performance.\n${topHits}`;
  }

  return `I found these relevant portfolio entries:\n${topHits}`;
};

export const localAssistantProvider: AssistantProvider = {
  async generateAnswer({ question }) {
    return searchPortfolio(question);
  },
};

export const getInitialAssistantLanguage = (): AssistantLanguage => "en";

export const getSuggestedQuestions = () => SUGGESTIONS;
