import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadgeSharePage } from './BadgeSharePage';

// Mock QRCode since it uses HTMLCanvasElement methods which are not fully implemented in jsdom
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mock-qr-data-url')),
  },
}));

describe('BadgeSharePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default fallback values', async () => {
    render(<BadgeSharePage />);
    
    // Check buttons
    expect(await screen.findByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /contact/i })).toBeInTheDocument();
  });

  it('opens share dialog when share button is clicked', async () => {
    render(<BadgeSharePage />);
    
    const shareBtn = screen.getByRole('button', { name: /share/i });
    
    await act(async () => {
      fireEvent.click(shareBtn);
    });
    
    // Dialog should render
    expect(screen.getByText('Share Badge')).toBeInTheDocument();
  });

  it('opens contacts dialog when contact button is clicked', async () => {
    render(<BadgeSharePage />);
    
    const contactBtn = screen.getByRole('button', { name: /contact/i });
    
    await act(async () => {
      fireEvent.click(contactBtn);
    });
    
    // Dialog should render
    expect(screen.getByText('Contacts')).toBeInTheDocument();
  });
});
