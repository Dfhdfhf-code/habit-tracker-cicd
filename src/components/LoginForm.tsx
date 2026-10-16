import { useState, useCallback, type FormEvent } from "react";
import { useAuth } from "../contexts/useAuth";

type Mode = "signin" | "signup";

export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      const { error: authError } =
        mode === "signin"
          ? await signIn(email, password)
          : await signUp(email, password);

      if (authError) {
        setError(authError);
      } else if (mode === "signup") {
        setError("Проверьте почту для подтверждения регистрации");
      }

      setLoading(false);
    },
    [mode, email, password, signIn, signUp]
  );

  return (
    <div className="app-container">
      <h1 className="app-title">Трекер привычек</h1>
      <p className="app-subtitle">
        {mode === "signin"
          ? "Войдите, чтобы продолжить"
          : "Создайте аккаунт"}
      </p>

      <div className="glass-card">
        <h2 className="card-title">
          {mode === "signin" ? "Вход" : "Регистрация"}
        </h2>
        <form onSubmit={handleSubmit} className="add-habit-form">
          <input
            type="email"
            className="glass-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="glass-input"
            placeholder="Пароль (минимум 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <p className="message-error">{error}</p>}

          <button
            type="submit"
            className="glass-button"
            disabled={loading}
            style={{ alignSelf: "flex-start" }}
          >
            {loading
              ? "Загрузка..."
              : mode === "signin"
                ? "Войти"
                : "Зарегистрироваться"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          style={{
            marginTop: 16,
            background: "none",
            border: "none",
            color: "#ffffff",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {mode === "signin"
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}

export default LoginForm;