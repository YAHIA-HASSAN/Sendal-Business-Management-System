import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm, { type LoginCredentials } from "../components/LoginForm/LoginForm";
import { mockLogin } from "../api/client";
import sendalLogo from "../assets/sendal-logo.png";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  async function handleLogin(credentials: LoginCredentials) {
    setMessage("");
    try {
      const result = await mockLogin(credentials.username, credentials.password);
      const storage = credentials.rememberMe ? localStorage : sessionStorage;
      storage.setItem("sendal.demo-token", result.token);
      localStorage.setItem("sendal.demo-user", JSON.stringify(result.user));
      navigate("/Home", { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر الاتصال بخادم الاختبار.");
    }
  }

  return (
    <main className="login-page" dir="rtl">
      <section className="login-card" aria-labelledby="login-title">
        <header className="login-brand">
          <img src={sendalLogo} alt="شعار سندال" />
          <span>سندال</span>
        </header>
        <div className="login-intro">
          <p className="login-eyebrow">نظام إدارة الأعمال</p>
          <h1 id="login-title">مرحبًا بعودتك</h1>
          <p>سجّل الدخول للمتابعة إلى لوحة إدارة متجرك.</p>
        </div>
        <LoginForm error={message} onSubmit={handleLogin} />
        <footer className="login-footer">© {new Date().getFullYear()} سندال لإدارة الأعمال</footer>
      </section>
      <aside className="login-aside" aria-hidden="true">
        <div className="login-aside-orb login-aside-orb-top" />
        <div className="login-aside-orb login-aside-orb-bottom" />
        <div className="login-aside-content">
          <span className="login-aside-mark">S</span>
          <p>كل أعمالك، في مكان واحد</p>
          <h2>إدارة أوضح.<br />قرارات أفضل.</h2>
          <span className="login-aside-caption">منظومة سندال لإدارة المتاجر والأعمال</span>
        </div>
      </aside>
    </main>
  );
}
