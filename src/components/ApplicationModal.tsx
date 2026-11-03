import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Job } from '../types';

interface ApplicationModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ApplicationRecord {
  jobId: string;
  applicantName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  submittedAt: string;
}

function isApplicationRecord(value: unknown): value is ApplicationRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'jobId' in value &&
    typeof value.jobId === 'string' &&
    'applicantName' in value &&
    typeof value.applicantName === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'phone' in value &&
    typeof value.phone === 'string' &&
    'resumeUrl' in value &&
    typeof value.resumeUrl === 'string' &&
    'submittedAt' in value &&
    typeof value.submittedAt === 'string'
  );
}

export function ApplicationModal({
  job,
  open,
  onOpenChange,
}: ApplicationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      nameRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSubmitted(false);
        setStorageError('');
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onOpenChange, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const record: ApplicationRecord = {
      jobId: job.id,
      applicantName: String(formData.get('applicantName') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      resumeUrl: String(formData.get('resumeUrl') ?? '').trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const savedApplications = localStorage.getItem('noinghe-applications');
      const parsed: unknown = savedApplications
        ? JSON.parse(savedApplications)
        : [];
      if (!Array.isArray(parsed) || !parsed.every(isApplicationRecord)) {
        throw new Error('Dữ liệu hồ sơ đã lưu không đúng định dạng.');
      }
      localStorage.setItem(
        'noinghe-applications',
        JSON.stringify([...parsed, record]),
      );
      setStorageError('');
      setSubmitted(true);
    } catch (error) {
      console.error('Không thể lưu thông tin ứng tuyển trên thiết bị.', error);
      setStorageError(
        'Chưa thể lưu thông tin trên thiết bị này. Vui lòng kiểm tra dung lượng lưu trữ và thử lại.',
      );
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setStorageError('');
    onOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClose={() => {
        setSubmitted(false);
        setStorageError('');
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          handleClose();
        }
      }}
      aria-labelledby="application-title"
      className="w-[min(100%-2rem,34rem)] max-w-none rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      {submitted ? (
        <section className="p-6 sm:p-8" role="status" aria-live="polite">
          <span
            aria-hidden="true"
            className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-2xl font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-100"
          >
            ✓
          </span>
          <h2
            id="application-title"
            className="mt-5 text-2xl font-extrabold"
          >
            Đã lưu hồ sơ ứng tuyển
          </h2>
          <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
            Thông tin ứng tuyển vị trí <strong>{job.title}</strong> đã được lưu
            trên thiết bị này. Đây là bản demo giao diện, hồ sơ chưa được gửi
            đến nhà tuyển dụng.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-6 rounded-xl bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Hoàn tất
          </button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-brand-700 dark:text-brand-100">
                ỨNG TUYỂN
              </p>
              <h2
                id="application-title"
                className="mt-1 text-2xl font-extrabold"
              >
                Gửi hồ sơ của bạn
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {job.title} · {job.company}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Đóng biểu mẫu ứng tuyển"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:hover:bg-slate-800"
            >
              ×
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-1.5 text-sm font-semibold">
              Họ và tên
              <input
                ref={nameRef}
                name="applicantName"
                autoComplete="name"
                required
                maxLength={100}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-brand-900"
                placeholder="Nguyễn Văn An"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-brand-900"
                placeholder="ban@email.com"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Số điện thoại
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                pattern="\+?[0-9]{9,15}"
                title="Nhập từ 9 đến 15 chữ số, có thể bắt đầu bằng dấu +."
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-brand-900"
                placeholder="0901234567"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Liên kết CV / hồ sơ cá nhân
              <input
                name="resumeUrl"
                type="url"
                maxLength={2048}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-normal text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-brand-900"
                placeholder="https://..."
              />
            </label>
            {storageError && (
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300" role="alert">
                {storageError}
              </p>
            )}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Bản demo chỉ lưu hồ sơ trên thiết bị của bạn, chưa gửi dữ liệu tới
            nhà tuyển dụng.
          </p>
          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-brand-700 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Xác nhận ứng tuyển
          </button>
        </form>
      )}
    </dialog>
  );
}
