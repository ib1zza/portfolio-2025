import { expect, test, describe } from 'vitest';

import {
  EASTER_EGG_DEFINITIONS,
  EASTER_EGG_COUNT,
  EASTER_EGG_LOG_FILE_ID,
  type EasterEggId,
} from './easterEggDefinitions';

describe('easterEggDefinitions', () => {
  test('defines 6 eggs', () => {
    expect(EASTER_EGG_DEFINITIONS).toHaveLength(6);
    expect(EASTER_EGG_COUNT).toBe(6);
  });

  test('each egg has id and label', () => {
    for (const egg of EASTER_EGG_DEFINITIONS) {
      expect(egg.id).toBeDefined();
      expect(egg.label).toBeDefined();
      expect(typeof egg.id).toBe('string');
      expect(typeof egg.label).toBe('string');
    }
  });

  test('EASTER_EGG_LOG_FILE_ID is easterEggLog', () => {
    expect(EASTER_EGG_LOG_FILE_ID).toBe('easterEggLog');
  });

  test('covers all expected egg ids', () => {
    const ids = EASTER_EGG_DEFINITIONS.map((e) => e.id);
    const expected: EasterEggId[] = [
      'hypercard-stack',
      'time-machine-hd',
      'special-menu',
      'last-disk',
      'trash-bomb',
      'terminal-matrix',
    ];
    expect(ids.sort()).toEqual(expected.sort());
  });
});
