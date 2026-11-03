import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApplicationModal } from '../components/ApplicationModal';
import jobsData from '../data/jobs.json';
import type { Job } from '../types';

const jobs: Job[] = jobsData;

interface DetailPageProps {
  favorites: string[];
  onToggleFavorite: (jobId: string) => void;
}

export function DetailPage({
  favorites,
  onToggleFavorite,
}: DetailPageProps) {
  const [applicationOpen, setApplicationOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const job = jobs.find((item) => item.id === id);

  if (!job) {
    return (
      <main className="page-shell py-16">
        <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">
          Không tìm thấy việc làm
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Tin tuyển dụng này không tồn tại hoặc đã được gỡ.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-lg bg-brand-700 px-4 py-2.5 font-bold text-white hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Trở về danh sách
        </Link>
      </main>
    );
  }

  const isFavorite = favorites.includes(job.id);

  return (
    <main className="page-shell pb-24 pt-6 sm:py-10 lg:pb-10">
      <Link
        to="/"
        className="rounded-sm text-sm font-bold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-brand-100"
      >
        ← Quay lại danh sách việc làm
      </Link>
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-6 dark:border-slate-800 sm:p-9">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-xl font-extrabold text-brand-700 dark:bg-brand-900 dark:text-brand-100">
                  {job.company.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-brand-700 dark:text-brand-100">
                    {job.company}
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                    {job.title}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {job.location} · Đăng {job.postedDaysAgo} ngày trước
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleFavorite(job.id)}
                aria-pressed={isFavorite}
                className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${
                  isFavorite
                    ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-100'
                    : 'border-slate-300 text-slate-700 hover:border-brand-600 hover:text-brand-700 dark:border-slate-700 dark:text-slate-200 dark:hover:text-brand-100'
                }`}
              >
                {isFavorite ? 'Đã lưu việc làm' : '♡ Lưu việc làm'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-6 dark:border-slate-800 sm:grid-cols-3 sm:p-9">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Mức lương</p>
              <p className="mt-1 font-bold text-slate-950 dark:text-white">{job.salary}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hình thức</p>
              <p className="mt-1 font-bold text-slate-950 dark:text-white">{job.type}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cấp bậc</p>
              <p className="mt-1 font-bold text-slate-950 dark:text-white">{job.level}</p>
            </div>
          </div>

          <div className="space-y-8 p-6 sm:p-9">
            <section aria-labelledby="description-heading">
              <h2
                id="description-heading"
                className="text-xl font-extrabold text-slate-950 dark:text-white"
              >
                Mô tả công việc
              </h2>
              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">
                {job.description}
              </p>
            </section>

            <section
              aria-labelledby="company-heading"
              className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-100">
                Nhà tuyển dụng
              </p>
              <h2
                id="company-heading"
                className="mt-2 text-lg font-bold text-slate-950 dark:text-white"
              >
                {job.company}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Khám phá cơ hội nghề nghiệp và kết nối trực tiếp với đội ngũ
                đang tuyển dụng.
              </p>
            </section>
          </div>
        </article>

        <aside className="lg:sticky lg:top-24">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
              Tóm tắt công việc
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Ngành nghề</dt>
                <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{job.category}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Địa điểm</dt>
                <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{job.location}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Kinh nghiệm / cấp bậc</dt>
                <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{job.level}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setApplicationOpen(true)}
              className="mt-6 hidden w-full rounded-xl bg-brand-700 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:block"
            >
              Ứng tuyển vị trí này
            </button>
            <p className="mt-3 hidden text-center text-xs leading-5 text-slate-500 dark:text-slate-400 lg:block">
              Miễn phí · Không cần tạo tài khoản
            </p>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        <button
          type="button"
          onClick={() => setApplicationOpen(true)}
          className="mx-auto block w-full max-w-3xl rounded-xl bg-brand-700 px-5 py-3 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Ứng tuyển vị trí này
        </button>
      </div>
      <ApplicationModal
        job={job}
        open={applicationOpen}
        onOpenChange={setApplicationOpen}
      />
    </main>
  );
}
