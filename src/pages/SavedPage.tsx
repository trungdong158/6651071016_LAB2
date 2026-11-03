import { Link } from 'react-router-dom';
import { JobCard } from '../components/JobCard';
import jobsData from '../data/jobs.json';
import type { Job } from '../types';

const jobs: Job[] = jobsData;

interface SavedPageProps {
  favorites: string[];
  onToggleFavorite: (jobId: string) => void;
}

export function SavedPage({ favorites, onToggleFavorite }: SavedPageProps) {
  const savedJobs = jobs.filter((job) => favorites.includes(job.id));

  return (
    <main className="page-shell min-h-[65vh] py-8 sm:py-12">
      <div className="mb-8">
        <Link
          to="/"
          className="text-sm font-bold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-brand-100"
        >
          ← Khám phá việc làm
        </Link>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-100">
          Danh sách cá nhân
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
          Việc làm đã lưu
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Những cơ hội bạn quan tâm được lưu trên thiết bị này.
        </p>
      </div>

      {savedJobs.length > 0 ? (
        <>
          <p className="mb-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {savedJobs.length} việc làm đã lưu
          </p>
          <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1025px]:grid-cols-3">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          <span
            aria-hidden="true"
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-700 dark:bg-brand-900 dark:text-brand-100"
          >
            ♡
          </span>
          <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
            Danh sách của bạn đang trống
          </h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600 dark:text-slate-300">
            Lưu những công việc phù hợp để xem lại và ứng tuyển khi bạn sẵn
            sàng.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-brand-700 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Tìm việc phù hợp
          </Link>
        </section>
      )}
    </main>
  );
}
