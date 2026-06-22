"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../providers";

export default function RegisterPage() {
  const router = useRouter();
  const { lang, setLang, theme, toggleTheme } = useApp();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"farmer" | "buyer" | "expert">("farmer");
  const [error, setError] = useState("");

  const t = lang === "kn"
    ? {
        title: "ನೋಂದಣಿ",
        subtitle: "ಹೊಸ ಖಾತೆ ನಿರ್ಮಿಸಿ.",
        identifier: "ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್",
        password: "ಪಾಸ್ವರ್ಡ್",
        confirmPassword: "ಪಾಸ್ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ",
        role: "ಪಾತ್ರ",
        submit: "ಖಾತೆ ಸೃಷ್ಟಿಸಿ",
        hint: "ನೋಂದಾಯಿಸಿದ ವಿವರಗಳು project ಫೋಲ್ಡರ್‌ನ data/users.json ನಲ್ಲಿ ಉಳಿಯುತ್ತವೆ.",
        error: "ಸರಿಯಾದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
      }
    : {
        title: "Register",
        subtitle: "Create a new account.",
        identifier: "Email or Mobile",
        password: "Password",
        confirmPassword: "Confirm Password",
        role: "Role",
        submit: "Create Account",
        hint: "Your account is saved in data/users.json in the project folder.",
        error: "Enter valid registration details.",
      };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password || password !== confirmPassword) {
      setError(t.error);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed.");
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    }
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
          <label className="block text-sm font-medium">
            {t.confirmPassword}
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none" />
          </label>
          <label className="block text-sm font-medium">
            {t.role}
            <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none">
              <option value="farmer">{lang === "kn" ? "ರೈತ" : "Farmer"}</option>
              <option value="buyer">{lang === "kn" ? "ಖರೀದಿದಾರ" : "Buyer"}</option>
              <option value="expert">{lang === "kn" ? "ತಜ್ಞ" : "Expert"}</option>
            </select>
          </label>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-xl bg-[#2d6a4f] px-4 py-3 font-semibold text-white" type="submit">{t.submit}</button>
        </form>
        <p className="mt-4 text-xs text-slate-500">{t.hint}</p>
        <div className="mt-4 flex justify-end">
          <Link href="/login" className="text-sm font-semibold text-[#2d6a4f] underline">
            {lang === "kn" ? "ಲಾಗಿನ್‌ಗೆ ಹಿಂದಿರುಗಿ" : "Back to login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
