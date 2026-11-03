import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ListPage } from './ListPage';

let intersectionCallback: IntersectionObserverCallback | undefined;

class MockIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: number[] = [];

  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

afterEach(() => {
  vi.unstubAllGlobals();
  intersectionCallback = undefined;
});

describe('ListPage infinite scroll', () => {
  it('loads the next batch when the scroll sentinel enters the viewport', async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ListPage favorites={[]} onToggleFavorite={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getByRole('status').textContent).toContain(
      'Cuộn xuống để tự động tải thêm',
    );

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(12);
    });
  });
});
