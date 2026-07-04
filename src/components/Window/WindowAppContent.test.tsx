import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';

vi.mock('../IconPainter', () => ({ IconPainter: () => <div data-testid="app-icon-painter" /> }));
vi.mock('../DitherStudio', () => ({ DitherStudio: () => <div data-testid="app-dither-studio" /> }));
vi.mock('../ModelViewerApp', () => ({ ModelViewerApp: () => <div data-testid="app-model-viewer" /> }));
vi.mock('../BadgeGenerator', () => ({ BadgeGenerator: () => <div data-testid="app-badge-generator" /> }));
vi.mock('../AudioPlayer', () => ({ AudioPlayer: () => <div data-testid="app-audio-player" /> }));
vi.mock('../VideoPlayer', () => ({ VideoPlayer: () => <div data-testid="app-video-player" /> }));
vi.mock('../SpaceInvaders', () => ({ SpaceInvaders: () => <div data-testid="app-space-invaders" /> }));
vi.mock('../PortfolioAssistant', () => ({ PortfolioAssistant: () => <div data-testid="app-portfolio-assistant" /> }));
vi.mock('../../features/easter-eggs/components/HyperCardStack', () => ({ HyperCardStack: () => <div data-testid="app-hypercard-stack" /> }));
vi.mock('../ImageViewer', () => ({ ImageViewer: () => <div data-testid="app-image-viewer" /> }));
vi.mock('../SimpleVideoPlayer', () => ({ SimpleVideoPlayer: () => <div data-testid="app-video-viewer" /> }));

import { WindowAppContent } from './WindowAppContent';

describe('WindowAppContent', () => {
  const baseProps = { isActive: true, title: 'Test', windowId: 'win1' };

  test('renders icon-painter', async () => {
    render(<WindowAppContent {...baseProps} app="icon-painter" savedIconId="ic1" />);
    expect(await screen.findByTestId('app-icon-painter')).toBeInTheDocument();
  });

  test('renders dither-studio', async () => {
    render(<WindowAppContent {...baseProps} app="dither-studio" />);
    expect(await screen.findByTestId('app-dither-studio')).toBeInTheDocument();
  });

  test('renders model-viewer', async () => {
    render(<WindowAppContent {...baseProps} app="model-viewer" />);
    expect(await screen.findByTestId('app-model-viewer')).toBeInTheDocument();
  });

  test('renders badge-generator', async () => {
    render(<WindowAppContent {...baseProps} app="badge-generator" />);
    expect(await screen.findByTestId('app-badge-generator')).toBeInTheDocument();
  });

  test('renders audio-player', async () => {
    render(<WindowAppContent {...baseProps} app="audio-player" fileUrl="track.mp3" />);
    expect(await screen.findByTestId('app-audio-player')).toBeInTheDocument();
  });

  test('renders video-player', async () => {
    render(<WindowAppContent {...baseProps} app="video-player" fileUrl="vid.mp4" />);
    expect(await screen.findByTestId('app-video-player')).toBeInTheDocument();
  });

  test('renders space-invaders', async () => {
    render(<WindowAppContent {...baseProps} app="space-invaders" />);
    expect(await screen.findByTestId('app-space-invaders')).toBeInTheDocument();
  });

  test('renders portfolio-assistant', async () => {
    render(<WindowAppContent {...baseProps} app="portfolio-assistant" />);
    expect(await screen.findByTestId('app-portfolio-assistant')).toBeInTheDocument();
  });

  test('renders hypercard-stack', async () => {
    render(<WindowAppContent {...baseProps} app="hypercard-stack" />);
    expect(await screen.findByTestId('app-hypercard-stack')).toBeInTheDocument();
  });

  test('renders image-viewer', async () => {
    render(<WindowAppContent {...baseProps} app="image-viewer" fileUrl="img.png" />);
    expect(await screen.findByTestId('app-image-viewer')).toBeInTheDocument();
  });

  test('renders video-viewer', async () => {
    render(<WindowAppContent {...baseProps} app="video-viewer" fileUrl="vid.webm" />);
    expect(await screen.findByTestId('app-video-viewer')).toBeInTheDocument();
  });
});
