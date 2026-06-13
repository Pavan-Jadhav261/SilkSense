"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { appendActivity, saveAuth, useApp } from "../../providers";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang, theme, toggleTheme } = useApp();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const userId = process.env.NEXT_PUBLIC_USER_ID || "user@example.com";
  const userPassword = process.env.NEXT_PUBLIC_USER_PASSWORD || "1234";

  const t = lang === "kn"
    ? {
        title: "ಲಾಗಿನ್",
        subtitle: "ರೈತ, ಖರೀದಿದಾರ ಅಥವಾ ತಜ್ಞರಾಗಿ ಪ್ರವೇಶಿಸಿ.",
        identifier: "ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್",
        password: "ಪಾಸ್ವರ್ಡ್",
        remember: "ನನ್ನನ್ನು ನೆನಪಿಡಿ",
        forgot: "ಪಾಸ್ವರ್ಡ್ ಮರೆತಿರಾ?",
        submit: "ಪ್ರವೇಶಿಸಿ",
        hint: "ಈ ಖಾತೆಯ ಲಾಗಿನ್ ವಿವರಗಳು ನಿಮ್ಮ .env ಫೈಲ್‌ನಿಂದ ಬರುತ್ತವೆ.",
        error: "ಸರಿಯಾದ ಲಾಗಿನ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
      }
    : {
        title: "Login",
        subtitle: "Sign in as Farmer, Buyer, or Expert.",
        identifier: "Email or Mobile",
        password: "Password",
        remember: "Remember Me",
        forgot: "Forgot Password?",
        submit: "Sign In",
        hint: "This account uses the values from your .env file.",
        error: "Enter the correct login credentials.",
      };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validIdentity = [userId, "9999999999"].includes(identifier.trim());
    if (!validIdentity || password !== userPassword) {
      setError(t.error);
      return;
    }
    saveAuth("farmer");
    appendActivity({
      role: "farmer",
      path: "/login",
      action: "login_success",
      meta: identifier.trim(),
    });
    if (remember) localStorage.setItem("seri-remember", "true");
    router.replace("/dashboard");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--page-bg)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
        <div className="mb-4 flex justify-end gap-2">
          <button className="chip" onClick={() => setLang(lang === "en" ? "kn" : "en")}>{lang === "en" ? "ಕನ್ನಡ" : "English"}</button>
          <button className="chip" onClick={toggleTheme}>{theme === "light" ? "Dark" : "Light"}</button>
        </div>
        <h1 className="text-3xl font-bold text-[#214d39]">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{t.subtitle}</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            {t.identifier}
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm font-medium">
            {t.password}
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none" />
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              {t.remember}
            </label>
            <a className="text-[#2d6a4f] underline" href="mailto:support@example.com">{t.forgot}</a>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-xl bg-[#2d6a4f] px-4 py-3 font-semibold text-white" type="submit">{t.submit}</button>
        </form>
        <p className="mt-4 text-xs text-slate-500">{t.hint}</p>
        <div className="mt-4 flex justify-end">
          <Link href="/admin-login" className="text-sm font-semibold text-[#2d6a4f] underline">
            {lang === "kn" ? "ಅಡ್ಮಿನ್ ಆಗಿ ಲಾಗಿನ್ ಮಾಡಿ" : "Login as admin"}
          </Link>
        </div>
      </div>
    </div>
  );
}
