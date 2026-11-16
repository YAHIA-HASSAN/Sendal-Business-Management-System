import { useState, type FormEvent } from "react";
import "./LoginForm.css";

export type LoginCredentials = {
  username: string;
  password: string;
  rememberMe: boolean;
};

type LoginFormProps = {
  onSubmit?: (credentials: LoginCredentials) => void;
  error?: string;
};

export default function LoginForm({ onSubmit, error }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.({ username: username.trim(), password, rememberMe });
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-field">
        <span>اسم المستخدم</span>
        <span className="login-input-wrap">
          <span className="login-input-icon" aria-hidden="true">♙</span>
          <input
            autoComplete="username"
            name="username"
            placeholder="أدخل اسم المستخدم"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </span>
      </label>

      <label className="login-field">
        <span>كلمة المرور</span>
        <span className="login-input-wrap">
          <span className="login-input-icon" aria-hidden="true">♧</span>
          <input
            autoComplete="current-password"
            name="password"
            placeholder="أدخل كلمة المرور"
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="password-visibility-button"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? "إخفاء" : "عرض"}
          </button>
        </span>
      </label>

      <div className="login-options">
        <label className="remember-me">
          <input checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} type="checkbox" />
          <span>تذكرني</span>
        </label>
        <button className="forgot-password" type="button" onClick={() => window.alert("يرجى التواصل مع مسؤول النظام لإعادة تعيين كلمة المرور.")}>
          نسيت كلمة المرور؟
        </button>
      </div>

      {error && <p className="login-error" role="alert">{error}</p>}

      <button className="login-submit" type="submit">
        تسجيل الدخول <span aria-hidden="true">←</span>
      </button>
    </form>
  );
}
