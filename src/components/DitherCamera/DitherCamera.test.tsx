import { fireEvent, render, screen, act } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

// Mock useThreeDither hook
vi.mock("../../hooks/useThreeDither", () => ({
  useThreeDither: vi.fn(),
}));

// Mock video element prototype
Object.defineProperty(HTMLMediaElement.prototype, "load", {
  value: vi.fn(),
  writable: true,
});
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  value: vi.fn(() => Promise.resolve()),
  writable: true,
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  value: vi.fn(),
  writable: true,
});

// Mock mediaDevices API
const mockStream = {
  getTracks: () => [{ stop: vi.fn() }],
  getVideoTracks: () => [{
    stop: vi.fn(),
    getSettings: () => ({ deviceId: "device-1" }),
  }],
};
const mockDevices = [
  { deviceId: "device-1", kind: "videoinput", label: "FaceTime HD Camera" },
  { deviceId: "device-2", kind: "videoinput", label: "Back Camera" },
];

Object.defineProperty(navigator, "mediaDevices", {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve(mockStream)),
    enumerateDevices: vi.fn(() => Promise.resolve(mockDevices)),
  },
  writable: true,
  configurable: true,
});

import { DitherCamera } from "./DitherCamera";

describe("DitherCamera", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders placeholder requesting camera on initial mount", async () => {
    render(<DitherCamera windowId="test-win" />);
    expect(screen.getByText("Requesting Camera Stream...")).toBeInTheDocument();
  });

  test("shows canvas once camera access is granted", async () => {
    await act(async () => {
      render(<DitherCamera windowId="test-win" />);
    });
    
    // Wait for promises in useEffect
    await act(async () => {
      await Promise.resolve();
    });

    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  test("renders settings controls", async () => {
    await act(async () => {
      render(<DitherCamera windowId="test-win" />);
    });
    
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Camera Settings")).toBeInTheDocument();
    expect(screen.getByText("Take Photo")).toBeInTheDocument();
    expect(screen.getByText("Invert Colors")).toBeInTheDocument();
  });

  test("toggles invert state when button is clicked", async () => {
    await act(async () => {
      render(<DitherCamera windowId="test-win" />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const invertBtn = screen.getByText("Invert Colors");
    fireEvent.click(invertBtn);

    // No errors thrown
    expect(invertBtn).toBeInTheDocument();
  });

  test("triggers snapshot download on click", async () => {
    await act(async () => {
      render(<DitherCamera windowId="test-win" />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Mock HTMLCanvasElement.prototype.toDataURL
    const toDataURLMock = vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,123");
    
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const photoBtn = screen.getByText("Take Photo");
    fireEvent.click(photoBtn);

    expect(toDataURLMock).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    toDataURLMock.mockRestore();
    clickSpy.mockRestore();
  });
});
