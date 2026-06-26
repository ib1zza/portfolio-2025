import { memo, useCallback, useState } from "react";
import type { FormEvent } from "react";

import { portfolio } from "../../data/portfolio";
import { MacButton, MacTextInput } from "../UIKit";
import {
  getInitialAssistantLanguage,
  getSuggestedQuestions,
  localAssistantProvider,
  sanitizeAssistantQuestion,
  type AssistantAnswer,
} from "./assistantSearch";
import s from "./PortfolioAssistant.module.scss";

const HISTORY_STORAGE_KEY = "portfolio-2025-assistant-history";
const MAX_HISTORY_ITEMS = 5;

type AssistantStatus = "idle" | "searching" | "answered" | "empty" | "error";

const readHistory = () => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]",
    );

    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is string => typeof item === "string")
          .map(sanitizeAssistantQuestion)
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const writeHistory = (items: string[]) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
};

const saveHistoryItem = (question: string) => {
  const nextHistory = [
    question,
    ...readHistory().filter((item) => item !== question),
  ].slice(0, MAX_HISTORY_ITEMS);

  writeHistory(nextHistory);

  return nextHistory;
};

export const PortfolioAssistant = memo(function PortfolioAssistant() {
  const language = getInitialAssistantLanguage();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [history, setHistory] = useState(readHistory);
  const [status, setStatus] = useState<AssistantStatus>("idle");

  const suggestions = answer?.suggestedQuestions ?? getSuggestedQuestions();
  const trimmedQuestion = question.trim();

  const askQuestion = useCallback(async (nextQuestion: string) => {
    const cleanQuestion = sanitizeAssistantQuestion(nextQuestion).trim();
    if (!cleanQuestion) return;

    setQuestion(cleanQuestion);
    setStatus("searching");

    try {
      const nextAnswer = await localAssistantProvider.generateAnswer({
        question: cleanQuestion,
        language,
        hits: [],
        portfolioContext: portfolio,
      });

      setAnswer(nextAnswer);
      setHistory(saveHistoryItem(cleanQuestion));
      setStatus(nextAnswer.hits.length ? "answered" : "empty");
    } catch {
      setStatus("error");
    }
  }, [language]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void askQuestion(trimmedQuestion);
  };

  return (
    <section className={s.assistant} aria-label="Assistant">
      <div className={s.queryPanel}>
        <div className={s.title}>Assistant</div>
        <form className={s.searchForm} onSubmit={handleSubmit}>
          <MacTextInput
            aria-label="Ask about portfolio"
            autoComplete="off"
            inputMode="text"
            pattern="[A-Za-z0-9 ]*"
            placeholder="Ask about Vue Firebase Simplex"
            value={question}
            onChange={(event) =>
              setQuestion(sanitizeAssistantQuestion(event.currentTarget.value))
            }
          />
          <MacButton
            disabled={!trimmedQuestion || status === "searching"}
            type="submit"
            variant="default"
          >
            {status === "searching" ? "..." : "Ask"}
          </MacButton>
        </form>

        <div className={s.inputHint}>English letters and numbers only</div>

        <div className={s.quickGroup} aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className={s.quickQuestion}
              type="button"
              onClick={() => void askQuestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <div className={s.history}>
            <div className={s.sectionLabel}>Recent questions</div>
            {history.map((item) => (
              <button
                key={item}
                className={s.historyItem}
                type="button"
                onClick={() => void askQuestion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={s.answerPanel} aria-live="polite">
        {status === "idle" && (
          <div className={s.emptyState}>
            Ask a question about the portfolio data. Everything is searched
            locally in the browser.
          </div>
        )}

        {status === "searching" && (
          <div className={s.emptyState}>Searching...</div>
        )}

        {status === "error" && (
          <div className={s.emptyState}>Could not compose an answer.</div>
        )}

        {(status === "answered" || status === "empty") && answer && (
          <div className={s.answerContent}>
            <p className={s.answerText}>{answer.text}</p>

            {answer.hits.length > 0 && (
              <div className={s.results}>
                <div className={s.sectionLabel}>Matches</div>
                {answer.hits.map((hit) => (
                  <article key={`${hit.kind}-${hit.id}`} className={s.result}>
                    <div className={s.resultHeader}>
                      <h2>{hit.title}</h2>
                      <span>{hit.kind}</span>
                    </div>
                    <p>{hit.summary}</p>
                    {hit.details[0] && <p>{hit.details[0]}</p>}
                    {hit.links.length > 0 && (
                      <ul className={s.links}>
                        {hit.links.map((link) => (
                          <li key={`${hit.id}-${link.href}`}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
});
