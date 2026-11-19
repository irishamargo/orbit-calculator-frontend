import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { applyMaxHeight, deleteOrbit, fetchOrbits, setMaxHeight } from "./orbitsSlice";
import { DEFAULT_IMAGE } from "./types";

export default function GridPage() {
  const dispatch = useAppDispatch();
  const { items, maxHeight, appliedMaxHeight, loading, dataSource } = useAppSelector((state) => state.orbits);
  const user = useAppSelector((state) => state.auth.user);

  return (
    <main className="page orbit-grid-page">
      <h1>Плитка типов орбит</h1>
      <form
        className="orbit-filter"
        onSubmit={(event) => {
          event.preventDefault();
          if (maxHeight === appliedMaxHeight) {
            void dispatch(fetchOrbits(maxHeight));
          }
          dispatch(applyMaxHeight(maxHeight));
        }}
      >
        <label htmlFor="max-height">Максимальная высота, км</label>
        <div className="filter-controls">
          <Form.Range
            id="max-height"
            min={0}
            max={40000}
            step={100}
            value={maxHeight}
            onChange={(event) => dispatch(setMaxHeight(Number(event.target.value)))}
          />
          <output>{maxHeight} км</output>
          <button type="submit" disabled={loading > 0}>Показать</button>
        </div>
      </form>
      {dataSource === "mock" && (
        <p className="mock-notice">Backend недоступен — показаны демонстрационные данные.</p>
      )}
      <div className="cards-grid">
        {items.map((orbit) => (
          <article className="orbit-card" key={orbit.id}>
            <Link
              to={`/?id=${orbit.id}`}
              className="orbit-card-link"
              aria-label="Открыть тип орбиты в ленте"
            >
              <img
                src={orbit.image || DEFAULT_IMAGE}
                alt={`Изображение: ${orbit.name}`}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_IMAGE;
                }}
              />
              <div className="card-content">
                <h2>{orbit.name}</h2>
                <p>Высота: {orbit.height === null ? "не указана" : `${orbit.height} км`}</p>
                <p>Наклонение: {orbit.inclination === null ? "не указано" : `${orbit.inclination}°`}</p>
                <p className="card-likes">♥ {orbit.likeCount}</p>
              </div>
            </Link>
            <div className="card-footer">
              {user && orbit.isCreator ? (
                <button
                  type="button"
                  className="delete-button"
                  disabled={loading > 0}
                  onClick={() => void dispatch(deleteOrbit(orbit.id))}
                >
                  Удалить
                </button>
              ) : (
                <span aria-hidden="true" />
              )}
              <span className={`status${orbit.status === "Черновик" ? " status-draft" : ""}`}>
                {orbit.status}
              </span>
            </div>
          </article>
        ))}
      </div>
      {items.length === 0 && <p className="empty-grid">По этому фильтру орбит нет.</p>}
    </main>
  );
}
