import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as jobsRepository from '../data/jobsRepository';
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

function renderListPage() {
  return render(
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ListPage favorites={[]} onToggleFavorite={vi.fn()} />
    </MemoryRouter>,
  );
}

function reachEndOfBatch() {
  act(() => {
    intersectionCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  intersectionCallback = undefined;
});

describe('ListPage cursor-based infinite scroll', () => {
  it('appends the next batch without removing old jobs or changing the scroll position', async () => {
    renderListPage();

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(10);
    });
    expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeTruthy();

    reachEndOfBatch();

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(20);
    });
    expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeTruthy();
    expect(screen.getAllByRole('heading', { name: 'Chuyên viên phân tích dữ liệu' }).length).toBeGreaterThan(0);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('appends three successive batches without duplicate job links', async () => {
    const originalFetch = jobsRepository.getJobBatch;
    const fetchBatch = vi.spyOn(jobsRepository, 'getJobBatch');
    fetchBatch.mockImplementation(async (source, cursor, limit, signal) => {
      if (cursor === 20) {
        return {
          jobs: source.slice(0, limit).map((job, index) => ({
            ...job,
            id: `test-job-${index}`,
            title: `Công việc kiểm thử ${index + 1}`,
          })),
          nextCursor: null,
          total: 30,
        };
      }

      const batch = await originalFetch(source, cursor, limit, signal);
      return cursor === 10 ? { ...batch, nextCursor: 20, total: 30 } : batch;
    });

    renderListPage();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10));

    reachEndOfBatch();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(20));
    expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeTruthy();

    reachEndOfBatch();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(30));
    expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Công việc kiểm thử 1' })).toBeTruthy();

    const jobLinks = screen.getAllByRole('article').map((article) =>
      article.querySelector('a[href^="/item/"]')?.getAttribute('href'),
    );
    expect(new Set(jobLinks).size).toBe(30);
    expect(fetchBatch.mock.calls.map(([, cursor, limit]) => [cursor, limit])).toEqual([
      [0, 10],
      [10, 10],
      [20, 10],
    ]);
    expect(screen.getByText('Bạn đã xem hết 30 việc làm phù hợp.')).toBeTruthy();
  });

  it('does not request the same cursor more than once while loading', async () => {
    const originalFetch = jobsRepository.getJobBatch;
    let finishRequest: (() => void) | undefined;
    const fetchBatch = vi.spyOn(jobsRepository, 'getJobBatch');
    fetchBatch.mockImplementation((source, cursor, limit, signal) => {
      if (cursor === 10 && !finishRequest) {
        return new Promise((resolve, reject) => {
          finishRequest = () => {
            void originalFetch(source, cursor, limit, signal).then(resolve, reject);
          };
        });
      }
      return originalFetch(source, cursor, limit, signal);
    });

    renderListPage();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10));
    reachEndOfBatch();
    await waitFor(() =>
      expect(fetchBatch.mock.calls.filter(([, cursor]) => cursor === 10)).toHaveLength(1),
    );
    reachEndOfBatch();
    expect(fetchBatch.mock.calls.filter(([, cursor]) => cursor === 10)).toHaveLength(1);

    finishRequest?.();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(20));
  });

  it('cancels the previous dataset request when search changes', async () => {
    const originalFetch = jobsRepository.getJobBatch;
    const pendingRequests: Array<() => void> = [];
    const fetchBatch = vi.spyOn(jobsRepository, 'getJobBatch');
    fetchBatch.mockImplementation((source, cursor, limit, signal) =>
      new Promise((resolve, reject) => {
        pendingRequests.push(() => {
          void originalFetch(source, cursor, limit, signal).then(resolve, reject);
        });
      }),
    );

    renderListPage();
    await waitFor(() => expect(fetchBatch).toHaveBeenCalledTimes(1));
    const firstRequestSignal = fetchBatch.mock.calls[0][3];

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Frontend Developer' },
    });
    await waitFor(() => expect(fetchBatch).toHaveBeenCalledTimes(2));
    expect(firstRequestSignal?.aborted).toBe(true);

    pendingRequests[0]();
    pendingRequests[1]();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
    expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeTruthy();
  });

  it('retries a failed batch and resets pagination when filters change', async () => {
    const fetchBatch = vi.spyOn(jobsRepository, 'getJobBatch');
    fetchBatch.mockRejectedValueOnce(new Error('Mất kết nối'));

    renderListPage();

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Thử tải lại' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10));

    reachEndOfBatch();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(20));
    fireEvent.change(screen.getByLabelText('Ngành nghề'), {
      target: { value: 'Công nghệ' },
    });

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10));
    expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Chuyên viên Marketing số' })).toBeNull();
    expect(screen.getByText('Bạn đã xem hết 10 việc làm phù hợp.')).toBeTruthy();
  });

  it('shows an empty state when search returns no jobs', async () => {
    renderListPage();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(10));

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'không có công việc này' },
    });

    expect(await screen.findByText(/Không tìm thấy việc làm phù hợp/)).toBeTruthy();
    expect(screen.queryByTestId('job-load-sentinel')).toBeNull();
  });
});
