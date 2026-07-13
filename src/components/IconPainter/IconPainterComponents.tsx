import { memo } from "react";
import { MacButton, PopupSelect } from "../UIKit";
import { TOOL_OPTIONS, EXPORT_FORMATS, PREVIEW_SIZES } from "./constants";
import type { Tool, ExportFormat, PreviewSize } from "./types";
import s from "./IconPainter.module.scss";

export const ToolControls = memo(function ToolControls({
  tool,
  onToolChange,
}: {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
}) {
  return (
    <div className={s.section}>
      {TOOL_OPTIONS.map((item) => (
        <MacButton
          key={item}
          isPressed={tool === item}
          onClick={() => onToolChange(item)}
        >
          {item}
        </MacButton>
      ))}
    </div>
  );
});

export const EditControls = memo(function EditControls({
  canUndo,
  canRedo,
  isGridVisible,
  onUndo,
  onRedo,
  onToggleGrid,
  onClear,
  onInvert,
}: {
  canUndo: boolean;
  canRedo: boolean;
  isGridVisible: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleGrid: () => void;
  onClear: () => void;
  onInvert: () => void;
}) {
  return (
    <>
      <div className={s.section}>
        <MacButton onClick={onUndo} disabled={!canUndo}>
          undo
        </MacButton>
        <MacButton onClick={onRedo} disabled={!canRedo}>
          redo
        </MacButton>
        <MacButton isPressed={isGridVisible} onClick={onToggleGrid}>
          grid
        </MacButton>
      </div>
      <div className={s.section}>
        <MacButton onClick={onClear}>clear</MacButton>
        <MacButton onClick={onInvert}>invert</MacButton>
      </div>
    </>
  );
});

export const ExportControls = memo(function ExportControls({
  exportFormat,
  onExportFormatChange,
  onExport,
  onSave,
  onSaveAs,
  savedIconId,
}: {
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  savedIconId?: string;
}) {
  return (
    <div className={s.exportRow}>
      <PopupSelect
        label="Format:"
        value={exportFormat}
        options={EXPORT_FORMATS}
        onChange={onExportFormatChange}
      />
      <MacButton variant="default" onClick={onExport}>
        export
      </MacButton>
      <MacButton onClick={onSave}>
        {savedIconId ? "save" : "save desktop"}
      </MacButton>
      <MacButton onClick={onSaveAs}>save as</MacButton>
    </div>
  );
});

export const PreviewCanvases = memo(function PreviewCanvases({
  setPreviewRef,
}: {
  setPreviewRef: (size: PreviewSize, element: HTMLCanvasElement | null) => void;
}) {
  return (
    <div className={s.previewWrap}>
      <div className={s.previews}>
        {PREVIEW_SIZES.map((size) => (
          <div key={size} className={s.previewItem}>
            <canvas
              ref={(element) => setPreviewRef(size, element)}
              className={s.preview}
              style={{ width: size, height: size }}
              width={size}
              height={size}
            />
            <span>{size}px</span>
          </div>
        ))}
      </div>
    </div>
  );
});
