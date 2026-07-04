import { render } from '@testing-library/react';
import { expect, test, describe } from 'vitest';

import { FinderIcon } from './FinderIcon';
import type { FinderIconType } from './FinderIcon';

function renderIcon(type: FinderIconType, opts?: { id?: string; savedIconId?: string }) {
  const { container } = render(
    <FinderIcon
      id={opts?.id ?? 'test'}
      type={type}
      isOpenedInactive={false}
      savedIconId={opts?.savedIconId}
    />,
  );
  return container;
}

describe('FinderIcon', () => {
  test('renders folder icon by default', () => {
    const container = renderIcon('folder');
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('renders app-iconPainter icon', () => {
    const container = renderIcon('app-iconPainter');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders app-ditherStudio icon', () => {
    const container = renderIcon('app-ditherStudio');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders app-modelViewer icon', () => {
    const container = renderIcon('app-modelViewer');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders app-badgeGenerator icon', () => {
    const container = renderIcon('app-badgeGenerator');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders app-audioPlayer icon', () => {
    const container = renderIcon('app-audioPlayer');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders app-videoPlayer icon', () => {
    const container = renderIcon('app-videoPlayer');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders app-spaceInvaders icon', () => {
    const container = renderIcon('app-spaceInvaders');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders app-portfolioAssistant icon', () => {
    const container = renderIcon('app-portfolioAssistant');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders trash icon', () => {
    const container = renderIcon('trash');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders disk icon', () => {
    const container = renderIcon('disk');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders file-audio icon', () => {
    const container = renderIcon('file-audio');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders file-video icon', () => {
    const container = renderIcon('file-video');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders file-image icon', () => {
    const container = renderIcon('file-image');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders file icon', () => {
    const container = renderIcon('file');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders vk icon', () => {
    const container = renderIcon('vk');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders telegram icon', () => {
    const container = renderIcon('telegram');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders email icon', () => {
    const container = renderIcon('email');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders github icon', () => {
    const container = renderIcon('github');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('renders saved-icon without savedIconId', () => {
    const container = renderIcon('saved-icon');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
