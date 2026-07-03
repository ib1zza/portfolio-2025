import { bench, describe } from 'vitest';

describe('Array traversal optimization', () => {
  const currentId = 'target-id';
  const smallArray = [{ id: '1' }, { id: '2' }, { id: 'target-id' }, { id: '4' }];
  const largeArray = Array.from({ length: 100 }, (_, i) => ({ id: i.toString() }));
  largeArray.push({ id: 'target-id' });

  bench('small array - some', () => {
    smallArray.some(icon => icon.id === currentId);
  });

  bench('small array - for loop', () => {
    let found = false;
    for (let i = 0; i < smallArray.length; i++) {
      if (smallArray[i].id === currentId) {
        found = true;
        break;
      }
    }
  });

  bench('large array - some', () => {
    largeArray.some(icon => icon.id === currentId);
  });

  bench('large array - for loop', () => {
    let found = false;
    for (let i = 0; i < largeArray.length; i++) {
      if (largeArray[i].id === currentId) {
        found = true;
        break;
      }
    }
  });
});
