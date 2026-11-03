import { Link } from 'react-router-dom';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  isFavorite: boolean;
  onToggleFavorite: (jobId: string) => void;
}

export function JobCard({
  job,
  isFavorite,
  onToggleFavorite,
}: JobCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition duration-200 hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg font-extrabold text-brand-700 dark:bg-brand-900 dark:text-brand-100">
          {job.company.charAt(0)}
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(job.id)}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${
            isFavorite
              ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-100'
              : 'border-slate-200 text-slate-700 hover:border-brand-600 hover:text-brand-700 dark:border-slate-700 dark:text-slate-200 dark:hover:text-brand-100'
          }`}
          aria-label={
            isFavorite
              ? `Bỏ lưu việc làm ${job.title}`
              : `Lưu việc làm ${job.title}`
          }
          aria-pressed={isFavorite}
        >
          {isFavorite ? 'Đã lưu' : 'Lưu việc'}
        </button>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-100">
          {job.category}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {job.postedDaysAgo === 0 ? 'Hôm nay' : `${job.postedDaysAgo} ngày trước`}
        </span>
      </div>
      <h2 className="text-lg font-bold leading-snug text-slate-950 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-100">
        <Link
          to={`/item/${job.id}`}
          className="rounded-sm hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:hover:text-brand-100"
        >
          {job.title}
        </Link>
      </h2>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
        {job.company}
      </p>
      <dl className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-slate-400">⌖</span>
          <dt className="sr-only">Địa điểm</dt>
          <dd>{job.location}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-slate-400">◷</span>
          <dt className="sr-only">Hình thức làm việc</dt>
          <dd>{job.type}</dd>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <dt className="sr-only">Mức lương</dt>
          <dd className="font-bold text-brand-700 dark:text-brand-100">
            {job.salary}
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {job.type}
        </span>
        <Link
          to={`/item/${job.id}`}
          className="rounded-lg px-3 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-brand-100 dark:hover:bg-brand-900"
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}
