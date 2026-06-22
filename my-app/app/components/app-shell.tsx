"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "../providers";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard" },
  { href: "/learning-center", labelKey: "learning" },
  { href: "/market-maps", labelKey: "markets" },
  { href: "/chatbot", labelKey: "chatbot" },
  { href: "/admin", labelKey: "admin" },
] as const;

const labels = {
  en: {
    brand: "SmartSeri",
    dashboard: "Dashboard",
    learning: "Learning Center",
    markets: "Market Maps",
    chatbot: "AI Chatbot",
    admin: "Admin",
    language: "ಕನ್ನಡ",
    logout: "Logout",
    themeDark: "Dark",
    themeLight: "Light",
    adminLogin: "Admin Login",
  },
  kn: {
    brand: "ಸ್ಮಾರ್ಟ್ ಸೇರಿ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    learning: "ಕಲಿಕೆ ಕೇಂದ್ರ",
    markets: "ಮಾರುಕಟ್ಟೆ ನಕ್ಷೆಗಳು",
    chatbot: "AI ಚಾಟ್‌ಬಾಟ್",
    admin: "ಅಡ್ಮಿನ್",
    language: "English",
    logout: "ಲಾಗೌಟ್",
    themeDark: "ಡಾರ್ಕ್",
    themeLight: "ಲೈಟ್",
    adminLogin: "ಅಡ್ಮಿನ್ ಲಾಗಿನ್",
  },
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, theme, toggleTheme, logout, role, logActivity } = useApp();
  const pathname = usePathname();
  const t = labels[lang];
  const lastLoggedPath = useRef<string>("");

  useEffect(() => {
    if (pathname !== "/" && lastLoggedPath.current !== pathname) {
      logActivity("page_view", pathname);
      lastLoggedPath.current = pathname;
    }
  }, [logActivity, pathname]);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--page-fg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link href="/dashboard" className="text-lg font-bold text-[#2d6a4f]">
            {t.brand}
          </Link>
          <nav className="hidden gap-2 md:flex">
            {navItems
              .filter((item) => item.href !== "/admin" || role === "admin")
              .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? "bg-[#2d6a4f] text-white"
                    : "text-[var(--page-fg)]"
                }`}
              >
                {t[item.labelKey]}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {role === "admin" ? (
              <span className="chip bg-[#d8f3dc] text-[#1b4332]">Admin</span>
            ) : (
              <Link href="/admin-login" className="chip">
                {t.adminLogin}
              </Link>
            )}
            <button className="chip" onClick={() => setLang(lang === "en" ? "kn" : "en")}>
              {t.language}
            </button>
            <button className="chip" onClick={toggleTheme}>
              {theme === "light" ? t.themeDark : t.themeLight}
            </button>
            <button className="chip" onClick={logout}>
              {t.logout}
            </button>
          </div>
        </div>
      </header>
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 md:hidden">
        <div className="flex flex-wrap gap-2">
          {navItems
            .filter((item) => item.href !== "/admin" || role === "admin")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-xs font-medium ${
                  pathname === item.href ? "bg-[#2d6a4f] text-white" : "bg-emerald-50 text-[#214d39]"
                }`}
              >
                {t[item.labelKey]}
              </Link>
            ))}
        </div>
      </div>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
