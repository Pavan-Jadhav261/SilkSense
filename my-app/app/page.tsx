"use client";

import Link from "next/link";
import { useApp, uiText } from "./providers";

export default function LandingPage() {
  const { lang, setLang, theme, toggleTheme } = useApp();
  const t = uiText[lang];

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--page-fg)]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <div className="text-lg font-bold text-[#2d6a4f]">SmartSeri</div>
        <div className="flex items-center gap-2">
          <button className="chip" onClick={() => setLang(lang === "en" ? "kn" : "en")}>{lang === "en" ? "ಕನ್ನಡ" : "English"}</button>
          <button className="chip" onClick={toggleTheme}>{theme === "light" ? "Dark" : "Light"}</button>
          <Link href="/login" className="chip">{t.signIn}</Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-6 md:py-16">
        <section className="space-y-5">
          <p className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Sericulture platform
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#214d39] md:text-6xl">{t.landingTitle}</h1>
          <p className="max-w-2xl text-lg text-slate-600">{t.landingSubtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-[#2d6a4f] px-6 py-3 font-semibold text-white">{t.start}</Link>
            <Link href="/learning-center" className="rounded-full border border-emerald-200 px-6 py-3 font-semibold text-[#2d6a4f]">{lang === "en" ? "Preview Learning Center" : "ಕಲಿಕೆ ಕೇಂದ್ರ ನೋಡಿ"}</Link>
          </div>
        </section>
        <section className="section-panel grid gap-4">
          <h2 className="section-title">{t.featuresTitle}</h2>
          <div className="grid gap-4">
            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">{t.featureLearning}</div>
            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">{t.featureMarket}</div>
            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">{t.featureChat}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
