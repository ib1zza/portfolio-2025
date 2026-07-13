import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HapticsTester } from './HapticsTester';

const mockSiteLoaded = vi.fn();
const mockFileOpen = vi.fn();
const mockEasterEgg = vi.fn();

vi.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    siteLoaded: mockSiteLoaded,
    fileOpen: mockFileOpen,
    easterEgg: mockEasterEgg,
  }),
}));

describe('HapticsTester', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly with title and button groups', () => {
    render(<HapticsTester />);
    expect(screen.getByText('WebHaptics Test Page')).toBeInTheDocument();
    expect(screen.getByText('Project Effects')).toBeInTheDocument();
    expect(screen.getByText('Site Loaded')).toBeInTheDocument();
    expect(screen.getByText('File Open')).toBeInTheDocument();
  });

  it('calls haptics hook function when button is clicked', async () => {
    render(<HapticsTester />);
    
    const siteLoadedBtn = screen.getByRole('button', { name: /Site Loaded/ });
    
    await act(async () => {
      fireEvent.click(siteLoadedBtn);
    });
    
    expect(mockSiteLoaded).toHaveBeenCalledOnce();
    
    // Status text should be updated
    expect(screen.getByText('Last effect:')).toBeInTheDocument();
    expect(screen.getAllByText('Site Loaded')).toHaveLength(2);
  });

  it('calls easterEgg with happyMac when happyMac button is clicked', async () => {
    render(<HapticsTester />);
    
    const happyMacBtn = screen.getByRole('button', { name: /Happy Mac/ });
    
    await act(async () => {
      fireEvent.click(happyMacBtn);
    });
    
    expect(mockEasterEgg).toHaveBeenCalledWith('happyMac');
  });

  it('disables buttons during execution of haptic effect', async () => {
    render(<HapticsTester />);
    
    const siteLoadedBtn = screen.getByRole('button', { name: /Site Loaded/ });
    
    await act(async () => {
      fireEvent.click(siteLoadedBtn);
    });
    
    // Buttons should become disabled
    expect(siteLoadedBtn).toBeDisabled();
    
    // Wait for the async runEffect promise to resolve and then advance fake timers
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(200);
    });
    
    // Buttons should become enabled again
    expect(siteLoadedBtn).not.toBeDisabled();
  });
});
