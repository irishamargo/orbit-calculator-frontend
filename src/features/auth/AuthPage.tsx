import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { authHttp } from "../../api/client";
import {
  clearUser,
  setAuthError,
  setAuthLoading,
  setUser,
  type AuthUser,
} from "./authSlice";

function getMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return "Не удалось связаться с сервером. Проверьте, запущен ли backend.";
}

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const target = (location.state as { from?: string } | null)?.from || "/";

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    try {
      const response = await authHttp.post<{ user: AuthUser }>(
        "/api/orbit-users/authentication",
        { email, password },
      );
      dispatch(setUser(response.data.user));
      navigate(target, { replace: true });
    } catch (requestError) {
      dispatch(setAuthError(getMessage(requestError)));
    } finally {
      dispatch(setAuthLoading(false));
    }
  }

  async function logout() {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    try {
      await authHttp.post("/api/orbit-users/deauthentication");
      dispatch(clearUser());
    } catch (requestError) {
      dispatch(setAuthError(getMessage(requestError)));
    } finally {
      dispatch(setAuthLoading(false));
    }
  }

  return (
    <main className="page auth-page">
      <h1>{user ? "Профиль" : "Вход"}</h1>
      {user ? (
        <section className="profile-card">
          <p>Вы вошли как <strong>{user.name}</strong></p>
          <p>{user.email}</p>
          <Button className="primary-action" disabled={loading} onClick={() => void logout()}>
            Выйти
          </Button>
        </section>
      ) : (
        <Form onSubmit={(event) => void login(event)}>
          <Form.Group controlId="login-email">
            <Form.Label>Электронная почта</Form.Label>
            <Form.Control
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="login-password">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              autoComplete="current-password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Form.Group>
          {error && <p className="form-error">{error}</p>}
          <Button className="primary-action" type="submit" disabled={loading}>
            {loading ? "Входим…" : "Войти"}
          </Button>
          <p className="auth-hint">Введите данные ранее зарегистрированного пользователя.</p>
        </Form>
      )}
    </main>
  );
}
