import { Link, NavLink } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  favoriteCount: number;
  onToggleTheme: () => void;
}

export function Header({
  darkMode,
  favoriteCount,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold tracking-tight text-slate-950 dark:text-white"
          aria-label="Nối Nghề, về trang danh sách việc làm"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-lg text-white">
            N
          </span>
          <span className="text-xl">Nối Nghề</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Điều hướng chính">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 sm:px-3 ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-100'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            Việc làm
          </NavLink>
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 sm:px-3 ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-100'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <span className="hidden sm:inline">Việc đã lưu</span>
            <span className="sm:hidden">Đã lưu</span>
            <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
              {favoriteCount}
            </span>
          </NavLink>
          <button
            type="button"
            onClick={onToggleTheme}
            className="ml-1 grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={darkMode ? 'Bật giao diện sáng' : 'Bật giao diện tối'}
            title={darkMode ? 'Bật giao diện sáng' : 'Bật giao diện tối'}
          >
            <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
