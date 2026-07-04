import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';

import { FinderLabel } from './FinderLabel';

describe('FinderLabel', () => {
  test('renders children text', () => {
    render(<FinderLabel>My Folder</FinderLabel>);
    expect(screen.getByText('My Folder')).toBeInTheDocument();
  });
});
