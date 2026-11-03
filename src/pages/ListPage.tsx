import { useEffect, useMemo, useRef, useState } from 'react';
import jobsData from '../data/jobs.json';
import { JobCard } from '../components/JobCard';
import type { Job } from '../types';

const jobs: Job[] = jobsData;
const pageSize = 6;
const categories = [...new Set(jobs.map((job) => job.category))].sort((a, b) =>
  a.localeCompare(b, 'vi'),
);
const locations = [...new Set(jobs.map((job) => job.location.split(',').pop()?.trim() ?? job.location))].sort(
  (a, b) => a.localeCompare(b, 'vi'),
);
const jobTypes = [...new Set(jobs.map((job) => job.type))].sort((a, b) =>
  a.localeCompare(b, 'vi'),
);

interface ListPageProps {
  favorites: string[];
  onToggleFavorite: (jobId: string) => void;
}

export function ListPage({ favorites, onToggleFavorite }: ListPageProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    const results = jobs.filter((job) => {
      const matchesQuery =
        !normalizedQuery ||
        [job.title, job.company, job.location, job.category, job.level].some(
          (value) =>
            value.toLocaleLowerCase('vi').includes(normalizedQuery),
        );
      const jobLocation = job.location.split(',').pop()?.trim() ?? job.location;
      return (
        matchesQuery &&
        (!category || job.category === category) &&
        (!location || jobLocation === location) &&
        (!jobType || job.type === jobType)
      );
    });

    return results.sort((first, second) => {
      if (sortOrder === 'oldest') {
        return second.postedDaysAgo - first.postedDaysAgo;
      }
      if (sortOrder === 'title') {
        return first.title.localeCompare(second.title, 'vi');
      }
      return first.postedDaysAgo - second.postedDaysAgo;
    });
  }, [category, jobType, location, query, sortOrder]);
  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasFilters = Boolean(query || category || location || jobType);

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setLocation('');
    setJobType('');
    setVisibleCount(pageSize);
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      visibleCount >= filteredJobs.length ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) =>
            Math.min(count + pageSize, filteredJobs.length),
          );
        }
      },
      { rootMargin: '240px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredJobs.length, visibleCount]);

  return (
    <main id="viec-lam" className="page-shell py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-brand-900 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full border-[48px] border-white/5" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-1/4 h-72 w-72 rounded-full bg-brand-700/40 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Cơ hội mới mỗi ngày
          </p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Công việc tốt
            <br className="hidden sm:block" /> bắt đầu từ đây.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50 sm:text-lg">
            Khám phá cơ hội nghề nghiệp phù hợp, kết nối với nhà tuyển dụng và
            tiến gần hơn tới công việc bạn mong muốn.
          </p>
          <label className="mt-7 flex max-w-3xl items-center gap-3 rounded-2xl bg-white p-2.5 shadow-xl shadow-emerald-950/20 focus-within:ring-4 focus-within:ring-emerald-300/50">
            <span aria-hidden="true" className="pl-2 text-xl text-slate-400">⌕</span>
            <span className="sr-only">Tìm theo vị trí, công ty hoặc địa điểm</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(pageSize);
              }}
              placeholder="Chức danh, kỹ năng hoặc công ty..."
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:ring-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setVisibleCount(pageSize);
                }}
                aria-label="Xóa từ khóa tìm kiếm"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                ×
              </button>
            )}
          </label>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-emerald-100">
            <span><strong className="text-white">{jobs.length}+</strong> vị trí tuyển dụng</span>
            <span><strong className="text-white">{new Set(jobs.map((job) => job.company)).size}</strong> nhà tuyển dụng</span>
            <span>Việc làm được cập nhật thường xuyên</span>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="job-list-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-100">
              Khám phá cơ hội
            </p>
            <h2
              id="job-list-heading"
              className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white"
            >
              Việc làm dành cho bạn
            </h2>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="title">Tên vị trí A–Z</option>
            </select>
          </label>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white">Lọc việc làm</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              {filteredJobs.length} kết quả
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-3">
            <label className="grid gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              Ngành nghề
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setVisibleCount(pageSize);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Tất cả ngành nghề</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              Địa điểm
              <select
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setVisibleCount(pageSize);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Tất cả địa điểm</option>
                {locations.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              Hình thức làm việc
              <select
                value={jobType}
                onChange={(event) => {
                  setJobType(event.target.value);
                  setVisibleCount(pageSize);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Tất cả hình thức</option>
                {jobTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg text-sm font-bold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-brand-100"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>

        {visibleJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1025px]:grid-cols-3">
            {visibleJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={favorites.includes(job.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Không tìm thấy việc làm phù hợp. Hãy thử từ khóa khác.
          </p>
        )}

        {visibleCount < filteredJobs.length && (
          <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Đang hiển thị {visibleJobs.length} / {filteredJobs.length} việc làm
            </p>
            <button
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(count + pageSize, filteredJobs.length))}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:border-brand-600 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:text-brand-100"
            >
              Xem thêm việc làm
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
