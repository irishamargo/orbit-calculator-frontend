import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchFeedOrbit, setOrbitLike } from "./orbitsSlice";
import { DEFAULT_IMAGE } from "./types";

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { feed: orbit, loading, items } = useAppSelector((state) => state.orbits);
  const user = useAppSelector((state) => state.auth.user);
  const [expanded, setExpanded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const description = orbit?.description || "Описание не добавлено.";

  useEffect(() => {
    setVideoFailed(false);
    setExpanded(false);
  }, [orbit?.id]);

  async function showNext() {
    if (!orbit || loading) return;
    try {
      const next = await dispatch(
        fetchFeedOrbit({ id: orbit.id, next: true }),
      ).unwrap();
      if (!next) return;
      navigate(`/?id=${next.id}`);
      setExpanded(false);
      setVideoFailed(false);
    } catch {
      // The shared request message displays the API error.
    }
  }

  if (!orbit) {
    return (
      <main className="feed-page">
        <section className="empty-feed">
          {loading ? "Загружаем ленту…" : "Пока нет опубликованных типов орбит."}
        </section>
      </main>
    );
  }

  return (
    <main className="feed-page">
      <section className="feed-card">
        {videoFailed ? (
          <img
            className="feed-video"
            src={orbit.image || DEFAULT_IMAGE}
            alt="Орбита"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = DEFAULT_IMAGE;
            }}
          />
        ) : (
          <video
            key={`${orbit.id}-${orbit.video}`}
            className="feed-video"
            src={orbit.video}
            poster={orbit.image || DEFAULT_IMAGE}
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
                  {description}
                </p>
                <p className="feed-description" hidden={!expanded}>
                  {description}
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
                Высота<strong>{orbit.height === null ? "Не указана" : `${orbit.height} км`}</strong>
              </p>
              <p className="feed-parameter">
                Наклонение<strong>{orbit.inclination === null ? "Не указано" : `${orbit.inclination}°`}</strong>
              </p>
              <button
                type="button"
                className={`likes${orbit.isLiked ? " liked" : ""}`}
                aria-label={orbit.isLiked ? "Убрать отметку нравится" : "Нравится"}
                title={user ? "Нравится" : "Войдите, чтобы поставить лайк"}
                disabled={!user || loading > 0}
                onClick={() =>
                  void dispatch(
                    setOrbitLike({ id: orbit.id, liked: !orbit.isLiked }),
                  )
                }
              >
                <span className="heart">{orbit.isLiked ? "♥" : "♡"}</span>
                <span className="like-count">{orbit.likeCount}</span>
              </button>
              <button
                type="button"
                className="next-button"
                aria-label="Следующий тип орбиты"
                disabled={loading > 0 || items.length === 0}
                onClick={() => void showNext()}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
