import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { Header } from './components/Header';
import { DetailPage } from './pages/DetailPage';
import { ListPage } from './pages/ListPage';
import { SavedPage } from './pages/SavedPage';

function readStoredFavorites(): string[] {
  try {
    const value = localStorage.getItem('noinghe-favorites');
    if (!value) {
      return [];
    }

    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) &&
      parsed.every((item): item is string => typeof item === 'string')
      ? parsed
      : [];
  } catch (error) {
    console.error('Không thể đọc danh sách việc làm đã lưu.', error);
    return [];
  }
}

function readStoredTheme(): boolean {
  try {
    const storedTheme = localStorage.getItem('noinghe-dark-mode');
    if (storedTheme !== null) {
      return storedTheme === 'true';
    }
  } catch (error) {
    console.error('Không thể đọc tùy chọn giao diện.', error);
  }

  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

interface AppContentProps {
  favorites: string[];
  darkMode: boolean;
  notice: string;
  onToggleFavorite: (jobId: string) => void;
  onToggleTheme: () => void;
}

function AppContent({
  favorites,
  darkMode,
  notice,
  onToggleFavorite,
  onToggleTheme,
}: AppContentProps) {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const listScrollPositionRef = useRef(0);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') {
      return;
    }

    const saveScrollPosition = () => {
      listScrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    saveScrollPosition();

    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
    };
  }, [location.pathname]);

  useLayoutEffect(() => {
    const previousPath = previousPathRef.current;
    const isDetailPage = location.pathname.startsWith('/item/');

    if (isDetailPage) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (location.pathname === '/' && previousPath.startsWith('/item/')) {
      window.scrollTo({
        top: listScrollPositionRef.current,
        behavior: 'instant',
      });
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header
        darkMode={darkMode}
        favoriteCount={favorites.length}
        onToggleTheme={onToggleTheme}
      />
      <div hidden={location.pathname !== '/'}>
        <ListPage
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
      <Routes>
        <Route path="/" element={null} />
        <Route
          path="/item/:id"
          element={
            <DetailPage
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          }
        />
        <Route
          path="/saved"
          element={
            <SavedPage
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          }
        />
        <Route
          path="*"
          element={
            <main className="page-shell py-16">
              <h1 className="text-2xl font-extrabold">Trang không tồn tại</h1>
              <Link
                to="/"
                className="mt-4 inline-block text-brand-700 underline dark:text-brand-100"
              >
                Về trang chủ
              </Link>
            </main>
          }
        />
      </Routes>
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl dark:bg-white dark:text-slate-950"
        >
          {notice}
        </div>
      )}
      <footer className="mt-12 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="page-shell grid gap-8 py-9 sm:grid-cols-2 sm:items-center">
          <div>
            <Link
              to="/"
              className="font-extrabold tracking-tight text-slate-950 dark:text-white"
            >
              Nối Nghề
            </Link>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Đồng hành cùng bạn trên hành trình tìm kiếm công việc phù hợp
              và phát triển sự nghiệp.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300 sm:justify-end">
            <Link className="hover:text-brand-700 dark:hover:text-brand-100" to="/">Tìm việc</Link>
            <Link className="hover:text-brand-700 dark:hover:text-brand-100" to="/saved">Việc làm đã lưu</Link>
          </div>
          <p className="border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500 sm:col-span-2">
            © 2026 Nối Nghề · Giao diện demo phục vụ học tập.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [favorites, setFavorites] = useState<string[]>(readStoredFavorites);
  const [darkMode, setDarkMode] = useState(readStoredTheme);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('noinghe-dark-mode', String(darkMode));
    } catch (error) {
      console.error('Không thể lưu tùy chọn giao diện.', error);
    }
  }, [darkMode]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timeoutId = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const toggleFavorite = (jobId: string) => {
    const isSaved = favorites.includes(jobId);
    const updatedFavorites = isSaved
      ? favorites.filter((favorite) => favorite !== jobId)
      : [...favorites, jobId];
    try {
      localStorage.setItem(
        'noinghe-favorites',
        JSON.stringify(updatedFavorites),
      );
    } catch (error) {
      console.error('Không thể lưu danh sách việc làm yêu thích.', error);
      setNotice('Không thể lưu thay đổi. Hãy kiểm tra bộ nhớ trình duyệt.');
      return;
    }

    setFavorites(updatedFavorites);
    setNotice(isSaved ? 'Đã xóa khỏi việc làm đã lưu.' : 'Đã lưu việc làm.');
  };

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent
        favorites={favorites}
        darkMode={darkMode}
        notice={notice}
        onToggleFavorite={toggleFavorite}
        onToggleTheme={() => setDarkMode((current) => !current)}
      />
    </BrowserRouter>
  );
}
