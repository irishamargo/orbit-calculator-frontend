import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Form } from "react-bootstrap";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";

type Orbit = {
  id: string;
  name: string;
  description: string;
  height: number;
  inclination: number;
  likeCount: number;
  image: string;
  video: string;
};

const DEFAULT_IMAGE = "/media/default-orbit.svg";
const DEFAULT_VIDEO = "/media/default-orbit.webm";

const mockOrbits: Orbit[] = [
  {
    id: "1",
    name: "МКС",
    description:
      "Орбита на высоте 400 км используется для исследований и наблюдения Земли.",
    height: 400,
    inclination: 51.6,
    likeCount: 3,
    image: DEFAULT_IMAGE,
    video: DEFAULT_VIDEO,
  },
  {
    id: "2",
    name: "Геостационарный спутник",
    description:
      "Геостационарная орбита позволяет спутнику оставаться над одной областью Земли.",
    height: 35786,
    inclination: 0,
    likeCount: 1,
    image: DEFAULT_IMAGE,
    video: DEFAULT_VIDEO,
  },
  {
    id: "3",
    name: "Солнечно-синхронная орбита",
    description:
      "Солнечно-синхронная орбита позволяет спутнику проходить над заданными участками Земли примерно в одно и то же местное солнечное время.",
    height: 650,
    inclination: 99.2,
    likeCount: 2,
    image: DEFAULT_IMAGE,
    video: DEFAULT_VIDEO,
  },
  {
    id: "13",
    name: "Средняя околоземная орбита",
    description:
      "Средняя околоземная орбита используется для навигационных и телекоммуникационных спутников.",
    height: 20000,
    inclination: 55,
    likeCount: 0,
    image: DEFAULT_IMAGE,
    video: DEFAULT_VIDEO,
  },
];

function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="Основная навигация">
      <NavLink
        to="/"
        end
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <span>Лента</span>
      </NavLink>
      <span className="nav-item nav-item-disabled" aria-disabled="true">
        <span>Добавление</span>
      </span>
      <NavLink
        to="/orbit-type/grid"
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <span>Плитка</span>
      </NavLink>
      <span className="nav-item nav-item-disabled" aria-disabled="true">
        <span>Войти</span>
      </span>
    </nav>
  );
}

function Phone({ children }: { children: ReactNode }) {
  const location = useLocation();
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    content.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="phone">
      <div className="phone-content" ref={content}>
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}

function Feed({ orbits }: { orbits: Orbit[] }) {
  const [params] = useSearchParams();
  const id = params.get("id");
  const index = Math.max(0, orbits.findIndex((orbit) => orbit.id === id));
  const orbit = orbits[index] || mockOrbits[0];
  const next = orbits.length ? orbits[(index + 1) % orbits.length] : orbit;

  const [expanded, setExpanded] = useState(false);
  const [likedByOrbit, setLikedByOrbit] = useState<Record<string, boolean>>({});
  const liked = likedByOrbit[orbit.id] ?? false;
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [orbit.id]);

  if (!orbits.length) {
    return (
      <main className="feed-page">
        <section className="empty-feed">Пока нет опубликованных типов орбит.</section>
      </main>
    );
  }

  return (
    <main className="feed-page">
      <section className="feed-card">
        {videoFailed ? (
          <img className="feed-video" src={DEFAULT_IMAGE} alt="Орбита" />
        ) : (
          <video
            className="feed-video"
            src={DEFAULT_VIDEO}
            poster={DEFAULT_IMAGE}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
          />
        )}
        <div className="feed-overlay" />
        <div className="feed-content">
          <div className="feed-layout">
            <div className="feed-info">
              <h1>{orbit.name}</h1>
              <div className="feed-description-block">
                <p className="feed-description-preview" hidden={expanded}>
                  {orbit.description}
                </p>
                <p className="feed-description" hidden={!expanded}>
                  {orbit.description}
                </p>
                <button
                  type="button"
                  className="more-button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? "Скрыть ↑" : "Ещё ↓"}
                </button>
              </div>
            </div>
            <div className="feed-actions">
              <p className="feed-parameter">
                Высота
                <strong>{orbit.height} км</strong>
              </p>
              <p className="feed-parameter">
                Наклонение
                <strong>{orbit.inclination}°</strong>
              </p>
              <button
                type="button"
                className={"likes" + (liked ? " liked" : "")}
                aria-label={liked ? "Убрать отметку нравится" : "Нравится"}
                onClick={() =>
                  setLikedByOrbit((previous) => ({
                    ...previous,
                    [orbit.id]: !Boolean(previous[orbit.id]),
                  }))
                }
              >
                <span className="heart">{liked ? "♥" : "♡"}</span>
                <span className="like-count">
                  {orbit.likeCount + (liked ? 1 : 0)}
                </span>
              </button>
              <Link
                to={"/?id=" + next.id}
                className="next-button"
                aria-label="Следующий тип орбиты"
              >
                →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Grid({ orbits }: { orbits: Orbit[] }) {
  const [height, setHeight] = useState(40000);
  const [shown, setShown] = useState(40000);
  const [removed, setRemoved] = useState<string[]>([]);
  const filtered = orbits.filter(
    (orbit) => orbit.height <= shown && !removed.includes(orbit.id),
  );

  return (
    <main className="page orbit-grid-page">
      <h1>Плитка типов орбит</h1>
      <form
        className="orbit-filter"
        onSubmit={(event) => {
          event.preventDefault();
          setShown(height);
        }}
      >
        <label htmlFor="max-height">Максимальная высота, км</label>
        <div className="filter-controls">
          <Form.Range
            id="max-height"
            min={0}
            max={40000}
            step={100}
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
          />
          <output>{height} км</output>
          <button type="submit">Показать</button>
        </div>
      </form>
      <div className="cards-grid">
        {filtered.map((orbit) => (
          <article className="orbit-card" key={orbit.id}>
            <Link
              to={"/?id=" + orbit.id}
              className="orbit-card-link"
              aria-label="Открыть тип орбиты в ленте"
            >
              <img
                src={DEFAULT_IMAGE}
                alt="Орбита"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_IMAGE;
                }}
              />
              <div className="card-content">
                <h2>{orbit.name}</h2>
                <p>Высота: {orbit.height} км</p>
                <p>Наклонение: {orbit.inclination}°</p>
                <p className="card-likes">♥ {orbit.likeCount}</p>
              </div>
            </Link>
            <div className="card-footer">
              <div className="delete-form">
                <button
                  type="button"
                  onClick={() =>
                    setRemoved((ids) => [...ids, orbit.id])
                  }
                >
                  Удалить
                </button>
              </div>
              <span className="status">Опубликован</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function AppLayout() {
  return (
    <Phone>
      <Routes>
        <Route path="/" element={<Feed orbits={mockOrbits} />} />
        <Route
          path="/orbit-type/grid"
          element={<Grid orbits={mockOrbits} />}
        />
        <Route path="*" element={<Feed orbits={mockOrbits} />} />
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