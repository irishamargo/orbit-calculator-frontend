import { useEffect, useRef, type ReactNode } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { authHttp } from "./api/client";
import { clearUser, setAuthError, setAuthLoading } from "./features/auth/authSlice";
import AuthPage from "./features/auth/AuthPage";
import AddPage from "./features/orbits/AddPage";
import FeedPage from "./features/orbits/FeedPage";
import GridPage from "./features/orbits/GridPage";
import { clearFeed, fetchFeedOrbit, fetchOrbits } from "./features/orbits/orbitsSlice";

function BottomNavigation() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector(
    (state) => state.orbits.loading > 0 || state.auth.loading,
  );

  async function logout() {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    try {
      await authHttp.post("/api/orbit-users/deauthentication");
      dispatch(clearUser());
    } catch {
      dispatch(setAuthError("Не удалось выйти: проверьте подключение к backend."));
    } finally {
      dispatch(setAuthLoading(false));
    }
  }

  return (
    <nav className="bottom-navigation" aria-label="Основная навигация">
      <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
        <span>Лента</span>
      </NavLink>
      <NavLink to="/orbit-type/add" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
        <span>Добавление</span>
      </NavLink>
      <NavLink to="/orbit-type/grid" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
        <span>Плитка</span>
      </NavLink>
      {user ? (
        <button type="button" className="nav-item nav-logout" disabled={loading} onClick={() => void logout()}>
          <span>Выйти</span>
        </button>
      ) : (
        <NavLink to="/auth" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span>Войти</span>
        </NavLink>
      )}
    </nav>
  );
}

function Phone({ children }: { children: ReactNode }) {
  const location = useLocation();
  const busy = useAppSelector(
    (state) => state.orbits.loading > 0 || state.auth.loading,
  );
  const error = useAppSelector((state) => state.orbits.error || state.auth.error);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="phone">
      <div className="phone-content" ref={contentRef}>
        {error && <p className="global-error" role="alert">{error}</p>}
        {children}
      </div>
      <BottomNavigation />
      {busy && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <span className="loading-spinner" />
          <span>Загрузка…</span>
        </div>
      )}
    </div>
  );
}

function AppLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const feed = useAppSelector((state) => state.orbits.feed);
  const authUserId = useAppSelector((state) => state.auth.user?.id);
  const appliedMaxHeight = useAppSelector((state) => state.orbits.appliedMaxHeight);

  useEffect(() => {
    dispatch(clearFeed());
    void dispatch(fetchOrbits(appliedMaxHeight));
  }, [appliedMaxHeight, authUserId, dispatch]);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const requestedId = Number(new URLSearchParams(location.search).get("id")) || undefined;
    if ((!requestedId && feed) || (requestedId && feed?.id === requestedId)) return;
    void dispatch(fetchFeedOrbit({ id: requestedId }));
  }, [dispatch, feed?.id, location.pathname, location.search]);

  return (
    <Phone>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/orbit-type/add" element={<AddPage />} />
        <Route path="/orbit-type/grid" element={<GridPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<FeedPage />} />
      </Routes>
    </Phone>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
