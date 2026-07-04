import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../IconPainter/iconPainterDesktop', () => ({
  ICON_GRID_SIZE: 16,
  createBlankIconPixels: () => Array(16 * 16).fill(false),
  iconPixelsToRects: (
    pixels: boolean[],
    scale: number,
    originX: number,
    originY: number,
  ) =>
    pixels
      .map((pixel, index) =>
        pixel
          ? `<rect x="${originX + (index % 16) * scale}" y="${originY + Math.floor(index / 16) * scale}" width="${scale}" height="${scale}"/>`
          : '',
      )
      .join(''),
}));

import {
  createBadgeSvg,
  createBadgeUrl,
  readBadgeInputFromSearch,
  CARD_WIDTH,
  CARD_HEIGHT,
} from './badgeCard';

const mockInput = {
  name: 'Test Name',
  role: 'Developer',
  company: 'Test Corp',
  about: 'I make things',
  contacts: [
    { label: 'Email', href: 'mailto:test@test.com' },
    { label: 'GitHub', href: 'https://github.com/test' },
  ],
  pixels: Array(16 * 16).fill(false),
};

describe('badgeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createBadgeSvg generates valid SVG', () => {
    const svg = createBadgeSvg(mockInput);
    expect(svg).toContain('<svg');
    expect(svg).toContain(`width="${CARD_WIDTH}"`);
    expect(svg).toContain(`height="${CARD_HEIGHT}"`);
    expect(svg).toContain('Test Name');
    expect(svg).toContain('Developer');
    expect(svg).toContain('Test Corp');
    expect(svg).toContain('I make things');
  });

  it('createBadgeSvg escapes XML in text', () => {
    const input = { ...mockInput, name: '<b>XSS</b>' };
    const svg = createBadgeSvg(input);
    expect(svg).toContain('&lt;b&gt;XSS&lt;/b&gt;');
  });

  it('createBadgeSvg includes pixel rects when pixels are set', () => {
    const pixels = Array(16 * 16).fill(false);
    pixels[0] = true;
    pixels[16] = true;
    const input = { ...mockInput, pixels };
    const svg = createBadgeSvg(input);
    expect(svg).toContain('<rect x="24" y="66"');
  });

  it('createBadgeUrl creates URL with all params', () => {
    const url = createBadgeUrl(mockInput);
    expect(url).toContain('/badge');
    expect(url).toContain('name=Test+Name');
    expect(url).toContain('role=Developer');
    expect(url).toContain('company=Test+Corp');
    expect(url).toContain('about=I+make+things');
    expect(url).toContain('contact0Label=Email');
    expect(url).toContain('icon=');
  });

  it('createBadgeUrl skips empty contact hrefs', () => {
    const input = {
      ...mockInput,
      contacts: [
        { label: 'Empty', href: '' },
        { label: 'Valid', href: 'https://example.com' },
      ],
    };
    const url = createBadgeUrl(input);
    expect(url).not.toContain('contact0Label=Empty');
    expect(url).toContain('contact0Label=Valid');
  });

  it('readBadgeInputFromSearch returns parsed values', () => {
    const search = 'name=John&role=Designer&company=DesignCo&about=I+design';
    const result = readBadgeInputFromSearch(search, mockInput);
    expect(result.name).toBe('John');
    expect(result.role).toBe('Designer');
    expect(result.company).toBe('DesignCo');
    expect(result.about).toBe('I design');
  });

  it('readBadgeInputFromSearch falls back to fallback for missing params', () => {
    const result = readBadgeInputFromSearch('', mockInput);
    expect(result.name).toBe(mockInput.name);
    expect(result.role).toBe(mockInput.role);
    expect(result.contacts).toEqual(mockInput.contacts);
  });

  it('readBadgeInputFromSearch parses contact params', () => {
    const search =
      'name=Test&role=Test&company=Test&about=Test&contact0Label=Email&contact0Href=mailto%3Aa%40b.com';
    const result = readBadgeInputFromSearch(search, mockInput);
    expect(result.contacts).toEqual([
      { label: 'Email', href: 'mailto:a@b.com' },
    ]);
  });

  it('readBadgeInputFromSearch falls back for company to stack param', () => {
    const search = 'name=Test&role=Test&stack=StackCo&about=Test';
    const result = readBadgeInputFromSearch(search, mockInput);
    expect(result.company).toBe('StackCo');
  });

  it('readBadgeInputFromSearch falls back for about to contact param', () => {
    const search = 'name=Test&role=Test&company=TestCo&contact=Reach+out';
    const result = readBadgeInputFromSearch(search, mockInput);
    expect(result.about).toBe('Reach out');
  });

  it('readBadgeInputFromSearch parses icon hex to pixels', () => {
    const search =
      'name=Test&role=Test&company=Test&about=Test&icon=ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const result = readBadgeInputFromSearch(search, mockInput);
    expect(result.pixels.length).toBe(256);
    expect(result.pixels.every((p) => p === true)).toBe(true);
  });
});
