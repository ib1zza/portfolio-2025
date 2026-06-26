import { lazy, memo, Suspense } from "react";

import type { DocumentBlock } from "../../store/useFileSystem";
import { getAssetPath } from "../../utils/assets";
import s from "./Window.module.scss";
import { EasterEggLogDocument } from "../../features/easter-eggs/components/EasterEggLogDocument";

const ProjectModelViewer = lazy(() =>
  import("../ProjectModelViewer").then((module) => ({
    default: module.ProjectModelViewer,
  })),
);

interface WindowDocumentContentProps {
  content: string | DocumentBlock[];
  documentStyle?: "default" | "centered-note" | "easter-eggs-log";
  isActive: boolean;
  onImageLoad: () => void;
}

export const WindowDocumentContent = memo(function WindowDocumentContent({
  content,
  documentStyle = "default",
  isActive,
  onImageLoad,
}: WindowDocumentContentProps) {
  if (documentStyle === "easter-eggs-log") {
    return <EasterEggLogDocument />;
  }

  if (documentStyle === "centered-note" && typeof content === "string") {
    return (
      <article className={s.centeredNoteDocument}>
        <div>
          {content.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    );
  }

  if (typeof content === "string") {
    return <div className={s.contentText}>{content}</div>;
  }

  const projectModel = content.find((block) => block.type === "projectModel");
  const textBlocks = content.filter((block) => block.type !== "projectModel");

  return (
    <article className={s.document}>
      <div className={s.documentText}>
        {textBlocks.map((block, index) => {
          switch (block.type) {
            case "title":
              return <h1 key={index}>{block.text}</h1>;
            case "heading":
              return <h2 key={index}>{block.text}</h2>;
            case "paragraph":
              return <p key={index}>{block.text}</p>;
            case "meta":
              return (
                <p key={index} className={s.documentMeta}>
                  <span>{block.label}:</span> {block.value}
                </p>
              );
            case "list":
              return (
                <ul key={index}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            case "links":
              return (
                <ul key={index} className={s.documentLinks}>
                  {block.items.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} target="_blank" rel="noreferrer">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              );
            case "image":
              return (
                <figure key={index}>
                  <img
                    src={getAssetPath(block.src)}
                    alt={block.alt}
                    onLoad={onImageLoad}
                  />
                  {block.caption && <figcaption>{block.caption}</figcaption>}
                </figure>
              );
          }
        })}
      </div>
      {projectModel?.type === "projectModel" && (
        <Suspense fallback={<div className={s.modelFallback} />}>
          <ProjectModelViewer isActive={isActive} model={projectModel.model} />
        </Suspense>
      )}
    </article>
  );
});
