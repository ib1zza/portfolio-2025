import { memo, useCallback, useMemo, useRef, useState } from "react";

import { portfolio } from "../../data/portfolio";
import { MacButton, PopupSelect } from "../UIKit";
import { ProjectModelViewer } from "../ProjectModelViewer";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import { getProjectModelWindowSize } from "../../constants/windowLayout";
import s from "./ModelViewerApp.module.scss";

type ModelPresetId = string;

const MODEL_PRESETS = portfolio.projects
  .filter((project) => project.model)
  .map((project) => ({
    label: project.title,
    model: project.model!,
    project,
    value: project.id,
  }));

interface ModelViewerAppProps {
  isActive: boolean;
  windowId: string;
}

export const ModelViewerApp = memo(function ModelViewerApp({
  isActive,
  windowId,
}: ModelViewerAppProps) {
  const { openWindowAnimated } = useWindowOpenAnimation();
  const setActive = useFileSystem((state) => state.setActive);
  const [selectedPresetId, setSelectedPresetId] = useState<ModelPresetId>(
    MODEL_PRESETS[0]?.value ?? "",
  );
  const openReadmeSourceRef = useRef<HTMLDivElement | null>(null);

  const selectedPreset = useMemo(
    () =>
      MODEL_PRESETS.find((preset) => preset.value === selectedPresetId) ??
      MODEL_PRESETS[0],
    [selectedPresetId],
  );

  const openSelectedReadme = useCallback(() => {
    if (!selectedPreset) return;

    const readmeId = `file-${selectedPreset.project.id}-readme`;

    setActive(readmeId);
    openWindowAnimated({
      id: readmeId,
      title: selectedPreset.project.title,
      parentId: readmeId,
      sourceRect: openReadmeSourceRef.current?.getBoundingClientRect(),
      preferredSize: getProjectModelWindowSize(),
      openerWindowId: windowId,
    });
  }, [openWindowAnimated, selectedPreset, setActive, windowId]);

  if (!selectedPreset) {
    return <div className={s.modelViewerApp}>No models</div>;
  }

  return (
    <div className={s.modelViewerApp}>
      <section className={s.viewerPanel}>
        <ProjectModelViewer
          key={selectedPreset.value}
          className={s.viewer}
          isActive={isActive}
          model={selectedPreset.model}
          size="large"
        />
        <div ref={openReadmeSourceRef}>
          <MacButton variant="default" onClick={openSelectedReadme}>
            open readme
          </MacButton>
        </div>
      </section>

      <section className={s.controlsPanel}>
        <div className={s.title}>3D Model Viewer</div>
        <PopupSelect
          label="Project:"
          value={selectedPresetId}
          options={MODEL_PRESETS}
          onChange={setSelectedPresetId}
          stackedOnMobile
        />

        <div className={s.meta}>
          <span>{selectedPreset.project.status}</span>
          <span>{selectedPreset.model.label}</span>
          <span>{selectedPreset.project.stack.join(", ")}</span>
        </div>

      </section>
    </div>
  );
});
