import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useThreeDither } from "../../hooks/useThreeDither";
import { MacButton, PopupSelect } from "../UIKit";
import s from "./DitherCamera.module.scss";

type DitherMode = "bayer" | "floyd" | "dots" | "ascii";

const MODE_OPTIONS = [
  { value: "bayer", label: "Bayer" },
  { value: "floyd", label: "Floyd" },
  { value: "dots", label: "Halftone" },
  { value: "ascii", label: "ASCII" },
];

const RESOLUTION_OPTIONS = [
  { value: "256", label: "256" },
  { value: "320", label: "320" },
  { value: "480", label: "480" },
];

const MATRIX_OPTIONS = [
  { value: "2", label: "2×2" },
  { value: "4", label: "4×4" },
  { value: "8", label: "8×8" },
];

export const DitherCamera = memo(function DitherCamera({
  windowId,
}: {
  windowId?: string;
}) {
  void windowId;

  // Camera settings
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);

  // Dither options
  const [ditherMode, setDitherMode] = useState<DitherMode>("bayer");
  const [resolution, setResolution] = useState("320");
  const [matrixSize, setMatrixSize] = useState<"2" | "4" | "8">("4");
  const [invert, setInvert] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Palette handling
  const palette = invert ? ["#ffffff", "#000000"] : ["#000000", "#ffffff"];

  const streamRef = useRef<MediaStream | null>(null);

  // Request camera and list devices
  useEffect(() => {
    const initCamera = async () => {
      try {
        // If we already have a stream matching the selectedDeviceId, avoid restarting it
        if (streamRef.current) {
          const activeTrack = streamRef.current.getVideoTracks()[0];
          if (activeTrack && activeTrack.getSettings().deviceId === selectedDeviceId) {
            return;
          }
          // Otherwise stop the old stream
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => {
            if (e.name !== "AbortError") {
              console.error("Error playing video:", e);
            }
          });

          // Read stream aspect ratio once metadata loads
          const checkDimensions = () => {
            if (videoRef.current && videoRef.current.videoWidth) {
              setAspectRatio(videoRef.current.videoWidth / videoRef.current.videoHeight);
            } else {
              setTimeout(checkDimensions, 100);
            }
          };
          checkDimensions();
        }

        // List devices to allow camera selection
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);

        // Sync selectedDeviceId with the actual device ID currently active
        const activeTrack = stream.getVideoTracks()[0];
        const actualDeviceId = activeTrack?.getSettings().deviceId;
        if (actualDeviceId && actualDeviceId !== selectedDeviceId) {
          setSelectedDeviceId(actualDeviceId);
        }
      } catch (err: unknown) {
        console.error("Camera access error:", err);
        setHasPermission(false);
        setErrorMsg(err instanceof Error ? err.message : "Could not access camera feed");
      }
    };

    initCamera();
  }, [selectedDeviceId]);

  // Handle final cleanup on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Run native dither shader with preserveDrawingBuffer enabled
  useThreeDither(canvasRef, videoRef, {
    mode: ditherMode,
    resolution: Number(resolution),
    palette,
    matrixSize: Number(matrixSize) as 2 | 4 | 8,
    preserveDrawingBuffer: true,
  });

  const handleDeviceChange = useCallback((val: string) => {
    setSelectedDeviceId(val);
  }, []);

  const handleInvertToggle = useCallback(() => {
    setInvert((prev) => !prev);
  }, []);

  const takeSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `dither-capture-${Date.now()}.png`;
    link.click();
  }, []);

  // Format device options for the dropdown selector
  const deviceOptions = devices.map((d, index) => ({
    value: d.deviceId,
    label: d.label || `Camera ${index + 1}`,
  }));

  return (
    <div className={s.ditherCamera}>
      {/* Column 1: Video Preview Panel */}
      <div className={s.previewPanel}>
        <div className={s.previewContainer} style={{ aspectRatio: String(aspectRatio) }}>
          <canvas
            ref={canvasRef}
            className={`${s.canvas} ${hasPermission !== true ? s.hidden : ""}`}
          />
          {hasPermission !== true && (
            <div className={s.placeholder}>
              {hasPermission === false ? (
                <>
                  <span>Camera Access Denied</span>
                  <span style={{ fontSize: "10px", opacity: 0.7 }}>{errorMsg}</span>
                </>
              ) : (
                <span>Requesting Camera Stream...</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Controls Panel */}
      <div className={s.controlPanel}>
        <div className={s.title}>Camera Settings</div>

        <div className={s.selects}>
          {deviceOptions.length > 1 && (
            <div className={s.row}>
              <PopupSelect
                label="Camera:"
                value={selectedDeviceId}
                options={deviceOptions}
                onChange={handleDeviceChange}
              />
            </div>
          )}

          <div className={s.row}>
            <PopupSelect
              label="Mode:"
              value={ditherMode}
              options={MODE_OPTIONS}
              onChange={(val) => setDitherMode(val as DitherMode)}
            />
          </div>

          <div className={s.row}>
            <PopupSelect
              label="Res:"
              value={resolution}
              options={RESOLUTION_OPTIONS}
              onChange={setResolution}
            />
          </div>

          {ditherMode === "bayer" && (
            <div className={s.row}>
              <PopupSelect
                label="Matrix:"
                value={matrixSize}
                options={MATRIX_OPTIONS}
                onChange={(val) => setMatrixSize(val as "2" | "4" | "8")}
              />
            </div>
          )}

          <div className={s.row} style={{ marginTop: "10px" }}>
            <MacButton
              variant="default"
              onClick={handleInvertToggle}
              style={{ width: "fit-content" }}
            >
              Invert Colors
            </MacButton>
          </div>
        </div>

        <div className={s.separator} />

        <div className={s.actions}>
          <MacButton
            variant="default"
            onClick={takeSnapshot}
            disabled={hasPermission !== true}
          >
            Take Photo
          </MacButton>
        </div>
      </div>

      {/* Hidden source stream video element */}
      <video ref={videoRef} className={s.videoHidden} autoPlay playsInline muted />
    </div>
  );
});
