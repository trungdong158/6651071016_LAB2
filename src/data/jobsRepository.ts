import type { Job } from '../types';

export interface JobBatch {
  jobs: Job[];
  nextCursor: number | null;
  total: number;
}

export async function getJobBatch(
  source: readonly Job[],
  cursor: number,
  limit: number,
  signal?: AbortSignal,
): Promise<JobBatch> {
  if (!Number.isInteger(cursor) || cursor < 0) {
    throw new RangeError('Cursor phải là số nguyên không âm.');
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError('Kích thước batch phải là số nguyên dương.');
  }
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException('Yêu cầu đã bị hủy.', 'AbortError');
  }

  const jobs = source.slice(cursor, cursor + limit);
  const nextOffset = cursor + jobs.length;

  return {
    jobs,
    nextCursor: nextOffset < source.length ? nextOffset : null,
    total: source.length,
  };
}
