import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const setActive = vi.fn();
  const openWindowAnimated = vi.fn();
  const qrToDataURL = vi.fn().mockResolvedValue('data:image/png;base64,fake');

  return { setActive, openWindowAnimated, qrToDataURL };
});

vi.mock('qrcode', () => ({
  default: { toDataURL: (...args: unknown[]) => mocks.qrToDataURL(...args) },
}));

vi.mock('../../store/useFileSystem', () => ({
  useFileSystem: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setActive: mocks.setActive }),
}));

vi.mock('../WindowOpenAnimation', () => ({
  useWindowOpenAnimation: () => ({
    openWindowAnimated: mocks.openWindowAnimated,
    closeWindowAnimated: vi.fn(),
  }),
}));

vi.mock('../IconPainter/iconPainterDesktop', () => ({
  createBlankIconPixels: () => new Array(1024).fill(false),
  ICON_DESKTOP_STORAGE_EVENT: 'icon-desktop-storage-update',
  readSavedIcons: () => [],
  readSavedIcon: () => null,
  ICON_GRID_SIZE: 32,
  iconPixelsToRects: () => [],
}));

import { BadgeGenerator } from './BadgeGenerator';

function renderBadge() {
  return render(<BadgeGenerator windowId="test-win" />);
}

describe('BadgeGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders input fields', () => {
    renderBadge();
    expect(screen.getByText('Name:')).toBeInTheDocument();
  });

  test('renders name field with default value', () => {
    renderBadge();
    const nameInput = screen.getByDisplayValue(/Mikhail/);
    expect(nameInput).toBeInTheDocument();
  });

  test('renders role field with default value', () => {
    renderBadge();
    const roleInput = screen.getByDisplayValue(/Frontend|Design/);
    expect(roleInput).toBeInTheDocument();
  });

  test('renders company field with default value', () => {
    renderBadge();
    const companyInput = screen.getByDisplayValue('GROKHOTOV STUDIO');
    expect(companyInput).toBeInTheDocument();
  });

  test('renders about field with default value', () => {
    renderBadge();
    expect(
      screen.getByDisplayValue(
        'I build UI kits, animation, and production websites.',
      ),
    ).toBeInTheDocument();
  });

  test('renders contact fields', () => {
    renderBadge();
    const contactLabels = screen.getAllByDisplayValue(/github|telegram|vk|email/i);
    expect(contactLabels.length).toBeGreaterThanOrEqual(3);
  });

  test('adds a contact', () => {
    renderBadge();
    fireEvent.click(screen.getByText('add contact'));
    const linkInputs = screen.getAllByLabelText(/link/i);
    expect(linkInputs.length).toBeGreaterThanOrEqual(1);
  });

  test('opens share dialog', async () => {
    renderBadge();
    fireEvent.click(screen.getByText('share'));
    expect(await screen.findByText('copy link')).toBeInTheDocument();
    expect(mocks.qrToDataURL).toHaveBeenCalled();
  });

  test('opens icon import dialog', () => {
    renderBadge();
    fireEvent.click(screen.getByText('import icon'));
    expect(screen.getByText('Choose Icon')).toBeInTheDocument();
  });

  test('opens icon painter', () => {
    renderBadge();
    fireEvent.click(screen.getByText('open icon painter'));
    expect(mocks.setActive).toHaveBeenCalledWith('iconPainter');
    expect(mocks.openWindowAnimated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'iconPainter' }),
    );
  });

  test('export png button exists', () => {
    renderBadge();
    expect(screen.getByText('export png')).toBeInTheDocument();
  });
});
