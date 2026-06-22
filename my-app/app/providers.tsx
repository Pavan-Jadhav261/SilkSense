"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type Lang = "en" | "kn";
export type ThemeMode = "light" | "dark";
export type Role = "farmer" | "admin" | "buyer" | "expert";

export type Activity = {
  id: string;
  timestamp: string;
  role: Role;
  path: string;
  action: string;
  meta?: string;
};

type AuthState = {
  isAuthed: boolean;
  role: Role;
};

type AppContextValue = {
  lang: Lang;
  setLang: (value: Lang) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  isAuthed: boolean;
  role: Role;
  setAuth: (value: AuthState) => void;
  logout: () => void;
  apiBase: string;
  logActivity: (action: string, meta?: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);
const defaultAuth: AuthState = { isAuthed: false, role: "farmer" };
const activityKey = "seri-activity-log";

export const uiText = {
  en: {
    landingTitle: "Smart Sericulture Platform",
    landingSubtitle: "Learn, track markets, and ask AI for sericulture help.",
    start: "Get Started",
    signIn: "Sign In",
    featuresTitle: "What you can do",
    featureLearning: "Explore videos and image guides.",
    featureMarket: "Find nearby markets and offices.",
    featureChat: "Talk to the sericulture assistant.",
  },
  kn: {
    landingTitle: "ಸ್ಮಾರ್ಟ್ ರೇಷ್ಮೆ ವೇದಿಕೆ",
    landingSubtitle: "ಕಲಿಯಿರಿ, ಮಾರುಕಟ್ಟೆಗಳನ್ನು ನೋಡಿ, ಮತ್ತು AI ಸಹಾಯ ಪಡೆಯಿರಿ.",
    start: "ಪ್ರಾರಂಭಿಸಿ",
    signIn: "ಲಾಗಿನ್",
    featuresTitle: "ನೀವು ಮಾಡಬಹುದಾದವು",
    featureLearning: "ವೀಡಿಯೊಗಳು ಮತ್ತು ಚಿತ್ರ ಮಾರ್ಗದರ್ಶಿಗಳನ್ನು ನೋಡಿ.",
    featureMarket: "ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು ಮತ್ತು ಕಚೇರಿಗಳನ್ನು ಹುಡುಕಿ.",
    featureChat: "ರೇಷ್ಮೆ ಸಹಾಯಕನೊಂದಿಗೆ ಮಾತನಾಡಿ.",
  },
} as const;

export function readActivityLog(): Activity[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(activityKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Activity[];
  } catch {
    return [];
  }
}

export function appendActivity(activity: Omit<Activity, "id" | "timestamp">) {
  if (typeof window === "undefined") return;
  const current = readActivityLog();
  const next: Activity = {
    ...activity,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(activityKey, JSON.stringify([next, ...current].slice(0, 500)));
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("seri-lang") as Lang | null) ?? "en";
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("seri-theme") as ThemeMode | null) ?? "light";
  });
  const [auth, setAuth] = useState<AuthState>(() => {
    if (typeof window === "undefined") return defaultAuth;
    const storedAuth = localStorage.getItem("seri-auth");
    return storedAuth ? (JSON.parse(storedAuth) as AuthState) : defaultAuth;
  });

  useEffect(() => {
    document.cookie = auth.isAuthed ? "seri-auth=1; path=/; max-age=86400" : "seri-auth=; path=/; max-age=0";
    document.cookie = auth.isAuthed ? `seri-role=${auth.role}; path=/; max-age=86400` : "seri-role=; path=/; max-age=0";
  }, [auth.isAuthed, auth.role]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("seri-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("seri-lang", lang);
    document.documentElement.lang = lang === "kn" ? "kn" : "en";
  }, [lang]);

  useEffect(() => {
    const isLoginPage = pathname === "/login";
    const isRegisterPage = pathname === "/register";
    const isPublicLanding = pathname === "/";
    const isAdminLoginPage = pathname === "/admin-login";
    if (!auth.isAuthed && !isLoginPage && !isRegisterPage && !isAdminLoginPage && !isPublicLanding) router.replace("/login");
    if (auth.isAuthed && (isLoginPage || isRegisterPage)) {
      router.replace(auth.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [auth.isAuthed, auth.role, pathname, router]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      setLang: setLangState,
      theme,
      toggleTheme: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
      isAuthed: auth.isAuthed,
      role: auth.role,
      setAuth,
      logout: () => {
        localStorage.removeItem("seri-auth");
        document.cookie = "seri-auth=; path=/; max-age=0";
        document.cookie = "seri-role=; path=/; max-age=0";
        setAuth(defaultAuth);
        router.replace("/login");
      },
      apiBase: process.env.NEXT_PUBLIC_API_BASE_URL || "",
      logActivity: (action: string, meta?: string) => {
        appendActivity({ role: auth.role, path: pathname, action, meta });
      },
    }),
    [auth.isAuthed, auth.role, lang, pathname, router, theme],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProviders");
  return context;
}

export function saveAuth(role: Role) {
  localStorage.setItem("seri-auth", JSON.stringify({ isAuthed: true, role }));
  document.cookie = "seri-auth=1; path=/; max-age=86400";
  document.cookie = `seri-role=${role}; path=/; max-age=86400`;
}
