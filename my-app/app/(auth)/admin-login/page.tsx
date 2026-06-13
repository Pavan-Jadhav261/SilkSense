"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { appendActivity, saveAuth, useApp } from "../../providers";

export default function AdminLoginPage() {
  const router = useRouter();
  const { lang, setLang, theme, toggleTheme } = useApp();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const adminId = process.env.NEXT_PUBLIC_ADMIN_ID || "admin";
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "1234";

  const t = lang === "kn"
    ? {
        title: "ಅಡ್ಮಿನ್ ಲಾಗಿನ್",
        subtitle: "ಬಳಕೆದಾರರ ಚಟುವಟಿಕೆಗಳನ್ನು ನೋಡುವ ಅಡ್ಮಿನ್ ಖಾತೆಗೆ ಪ್ರವೇಶಿಸಿ.",
        identifier: "ಅಡ್ಮಿನ್ ಐಡಿ",
        password: "ಪಾಸ್ವರ್ಡ್",
        submit: "ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್ ತೆರೆಯಿರಿ",
        hint: "ಈ ಲಾಗಿನ್ ವಿವರಗಳು ನಿಮ್ಮ .env ಫೈಲ್‌ನಿಂದ ಬರುತ್ತವೆ.",
        error: "ಸರಿಯಾದ ಅಡ್ಮಿನ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
      }
    : {
        title: "Admin Login",
        subtitle: "Sign in to the admin account that can view user activity.",
        identifier: "Admin ID",
        password: "Password",
        submit: "Open Admin Panel",
        hint: "These credentials come from your .env file.",
        error: "Enter the correct admin credentials.",
      };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (identifier.trim() !== adminId || password !== adminPassword) {
      setError(t.error);
      return;
    }
    saveAuth("admin");
    appendActivity({
      role: "admin",
      path: "/admin-login",
      action: "admin_login_success",
      meta: identifier.trim(),
    });
    router.replace("/admin");
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
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm font-medium">
            {t.password}
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none" />
          </label>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-xl bg-[#2d6a4f] px-4 py-3 font-semibold text-white" type="submit">{t.submit}</button>
        </form>
        <p className="mt-4 text-xs text-slate-500">{t.hint}</p>
      </div>
    </div>
  );
}
