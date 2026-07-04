import { bench, describe } from 'vitest';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`
  <!DOCTYPE html>
  <body>
    ${Array.from({ length: 1000 })
      .map((_, i) => `<div data-finder-item-id="item-${i}"></div>`)
      .join('\n')}
  </body>
`);
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.CSS = { escape: (s: string) => s } as any;

const items = Array.from({ length: 500 }).map((_, i) => ({ id: `item-${i * 2}` }));

// Mock getBoundingClientRect
dom.window.HTMLElement.prototype.getBoundingClientRect = function() {
  return {
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => {}
  };
};

const getSpatialItemsOriginal = (items: Array<{ id: string }>) =>
  items
    .map((item) => {
      const element = document.querySelector<HTMLElement>(
        `[data-finder-item-id="${CSS.escape(item.id)}"]`,
      );
      const rect = element?.getBoundingClientRect();

      if (!rect) return null;

      return {
        id: item.id,
        rect,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    })
    .filter((item) => item !== null);

const getSpatialItemsOptimized = (items: Array<{ id: string }>) => {
  const elements = document.querySelectorAll<HTMLElement>('[data-finder-item-id]');
  const elementsMap = new Map<string, HTMLElement>();
  for (const el of elements) {
    const id = el.getAttribute('data-finder-item-id');
    if (id) {
      elementsMap.set(id, el);
    }
  }

  return items
    .map((item) => {
      const element = elementsMap.get(item.id);
      const rect = element?.getBoundingClientRect();

      if (!rect) return null;

      return {
        id: item.id,
        rect,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    })
    .filter((item) => item !== null);
};

describe('getSpatialItems', () => {
  bench('original (multiple querySelector)', () => {
    getSpatialItemsOriginal(items);
  });

  bench('optimized (single querySelectorAll + Map)', () => {
    getSpatialItemsOptimized(items);
  });
});
