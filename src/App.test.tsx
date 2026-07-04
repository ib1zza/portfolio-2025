import { render, screen, act, waitFor } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./components/Desktop', () => ({
  default: () => <div data-testid="desktop">Desktop</div>,
}));

vi.mock('./components/CustomCursor', () => ({
  default: () => <div data-testid="cursor">Cursor</div>,
}));

vi.mock('./components/BadgeSharePage', () => ({
  BadgeSharePage: () => <div data-testid="badge-page">Badge</div>,
}));

vi.mock('./components/HapticsTester/HapticsTester', () => ({
  HapticsTester: () => <div data-testid="haptics-tester">Haptics</div>,
}));

const originalLocation = window.location;

function mockLocation(pathname: string) {
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, pathname, href: `http://localhost${pathname}` },
    writable: true,
  });
}

describe('App', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  test('renders haptics tester on /test route', async () => {
    mockLocation('/test');
    const App = (await import('./App')).default;
    render(<App />);
    expect(await screen.findByTestId('haptics-tester')).toBeInTheDocument();
  });

  test('renders badge share page on /badge route', async () => {
    mockLocation('/badge');
    const App = (await import('./App')).default;
    render(<App />);
    expect(await screen.findByTestId('badge-page')).toBeInTheDocument();
  });

  test('renders loader on default route', async () => {
    const App = (await import('./App')).default;
    render(<App />);
    await waitFor(() => {
      const loaderOverlay = document.querySelector('[class*="_loaderOverlay"]');
      expect(loaderOverlay).toBeInTheDocument();
    });
  });

  test('renders desktop after async initialization', async () => {
    const App = (await import('./App')).default;
    render(<App />);

    await waitFor(
      () => {
        expect(screen.getByTestId('desktop')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
