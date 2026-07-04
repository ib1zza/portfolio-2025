import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });

vi.mock('./assistantSearch', () => ({
  getInitialAssistantLanguage: () => 'en',
  getSuggestedQuestions: () => ['Tell me about your projects', 'What skills do you have?'],
  localAssistantProvider: {
    generateAnswer: vi.fn().mockResolvedValue({
      text: 'Here is the answer',
      hits: [{ kind: 'project', id: '1', title: 'Test Project', summary: 'A test', details: ['detail'], links: [] }],
      suggestedQuestions: ['Tell me more'],
    }),
  },
  sanitizeAssistantQuestion: (q: string) => q.replace(/[^a-zA-Z0-9 ]/g, ''),
}));

import { PortfolioAssistant } from './PortfolioAssistant';

describe('PortfolioAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    render(<PortfolioAssistant />);
    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  test('renders suggested questions', () => {
    render(<PortfolioAssistant />);
    expect(screen.getByText('Tell me about your projects')).toBeInTheDocument();
    expect(screen.getByText('What skills do you have?')).toBeInTheDocument();
  });

  test('renders input field', () => {
    render(<PortfolioAssistant />);
    const input = screen.getByLabelText('Ask about portfolio');
    expect(input).toBeInTheDocument();
  });

  test('shows Ask button', () => {
    render(<PortfolioAssistant />);
    expect(screen.getByText('Ask')).toBeInTheDocument();
  });

  test('Ask button is disabled when input is empty', () => {
    render(<PortfolioAssistant />);
    const askBtn = screen.getByText('Ask').closest('button');
    expect(askBtn).toBeDisabled();
  });

  test('shows idle placeholder text', () => {
    render(<PortfolioAssistant />);
    expect(screen.getByText(/Ask a question about the portfolio data/)).toBeInTheDocument();
  });

  test('accepts text input', async () => {
    const user = userEvent.setup();
    render(<PortfolioAssistant />);

    const input = screen.getByLabelText('Ask about portfolio');
    await user.type(input, 'Hello');

    expect(input).toHaveValue('Hello');
  });

  test('Ask button becomes enabled when input has text', async () => {
    const user = userEvent.setup();
    render(<PortfolioAssistant />);

    const input = screen.getByLabelText('Ask about portfolio');
    await user.type(input, 'test');

    const askBtn = screen.getByText('Ask').closest('button');
    expect(askBtn).toBeEnabled();
  });

  test('submits question and shows answer', async () => {
    const user = userEvent.setup();
    render(<PortfolioAssistant />);

    const input = screen.getByLabelText('Ask about portfolio');
    await user.type(input, 'Tell me about your projects');
    await user.click(screen.getByText('Ask'));

    expect(await screen.findByText('Here is the answer')).toBeInTheDocument();
  });

  test('shows search results after answer', async () => {
    const user = userEvent.setup();
    render(<PortfolioAssistant />);

    const input = screen.getByLabelText('Ask about portfolio');
    await user.type(input, 'projects');
    await user.click(screen.getByText('Ask'));

    expect(await screen.findByText('Test Project')).toBeInTheDocument();
  });

  test('clicking suggestion triggers search', async () => {
    const user = userEvent.setup();
    render(<PortfolioAssistant />);

    await user.click(screen.getByText('Tell me about your projects'));

    expect(await screen.findByText('Here is the answer')).toBeInTheDocument();
  });
});
