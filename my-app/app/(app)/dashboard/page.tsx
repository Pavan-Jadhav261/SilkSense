"use client";

import Link from "next/link";
import { useApp } from "../../providers";

const metrics = [
  ["Active Farmers", "18.5K"],
  ["Training Centers", "126"],
  ["AI Accuracy", "94%"],
  ["Languages", "4"],
];

export default function DashboardPage() {
  const { lang } = useApp();
  const t = lang === "kn"
    ? {
        title: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        subtitle: "ಒಂದೇ ಕೇಂದ್ರದಿಂದ ಎಲ್ಲ ಪ್ರಮುಖ ಉಪಕರಣಗಳನ್ನು ಬಳಸಿ.",
        cards: ["ಕಲಿಕೆ ಕೇಂದ್ರ", "ಮಾರುಕಟ್ಟೆ ನಕ್ಷೆಗಳು", "AI ಚಾಟ್‌ಬಾಟ್", "ರೋಗ ಮಾರ್ಗದರ್ಶನ"],
        body: ["ವೀಡಿಯೊಗಳು, ಗ್ಯಾಲರಿಗಳು ಮತ್ತು ತರಬೇತಿ ವಿಷಯ.", "ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು ಮತ್ತು ಮಾರ್ಗಗಳು.", "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ.", "ರೋಗ ಗುರುತು ಮತ್ತು ಉತ್ತಮ ಸಲಹೆಗಳು."],
      }
    : {
        title: "Dashboard",
        subtitle: "Access every major tool from one place.",
        cards: ["Learning Center", "Market Maps", "AI Chatbot", "Disease Guidance"],
        body: ["Videos, galleries, and training material.", "Nearby markets and routes.", "Ask in your preferred language.", "Diagnosis and best practices."],
      };

  return (
    <div className="space-y-6">
      <section className="section-panel">
        <h1 className="section-title">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.subtitle}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-[#2d6a4f]">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{label}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {t.cards.map((label, index) => (
          <Link
            key={label}
            href={["/learning-center", "/market-maps", "/chatbot", "/learning-center"][index]}
            className="section-panel block transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold text-[#214d39]">{label}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.body[index]}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
