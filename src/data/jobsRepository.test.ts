import { describe, expect, it } from 'vitest';
import jobsData from './jobs.json';
import { getJobBatch } from './jobsRepository';
import type { Job } from '../types';

const jobs: Job[] = jobsData;

describe('getJobBatch', () => {
  it('returns a cursor-based batch without repeating jobs', async () => {
    const first = await getJobBatch(jobs, 0, 6);
    const second = await getJobBatch(jobs, first.nextCursor ?? 0, 6);

    expect(first.jobs).toHaveLength(6);
    expect(first.nextCursor).toBe(6);
    expect(second.jobs).toHaveLength(6);
    expect(second.jobs.map((job) => job.id)).not.toContain(first.jobs[0].id);
    expect(second.nextCursor).toBe(12);
  });

  it('returns an empty final batch when the cursor is beyond available jobs', async () => {
    const batch = await getJobBatch(jobs, jobs.length, 6);

    expect(batch.jobs).toEqual([]);
    expect(batch.nextCursor).toBeNull();
    expect(batch.total).toBe(jobs.length);
  });

  it('rejects invalid cursors and batch sizes', async () => {
    await expect(getJobBatch(jobs, -1, 6)).rejects.toThrow(RangeError);
    await expect(getJobBatch(jobs, 0, 0)).rejects.toThrow(RangeError);
  });

  it('stops work when the request has been cancelled', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(getJobBatch(jobs, 0, 6, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
