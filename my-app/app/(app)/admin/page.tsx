"use client";

import { useMemo } from "react";
import { useApp, readActivityLog } from "../../providers";

export default function AdminPage() {
  const { lang, role } = useApp();
  const activities = useMemo(() => readActivityLog(), []);
  const t = lang === "kn"
    ? {
        title: "ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        subtitle: "ಬಳಕೆದಾರರ ಚಟುವಟಿಕೆಗಳು ಮತ್ತು ಸೆಷನ್ ವಿವರಗಳು.",
        total: "ಒಟ್ಟು ಚಟುವಟಿಕೆಗಳು",
        latest: "ಇತ್ತೀಚಿನ ವಿಶಿಷ್ಟ ಚಟುವಟಿಕೆಗಳು",
        noAccess: "ನೀವು ಅಡ್ಮಿನ್ ಅಲ್ಲ.",
        empty: "ಇನ್ನೂ ಯಾವುದೇ ಚಟುವಟಿಕೆ ಇಲ್ಲ.",
      }
    : {
        title: "Admin Dashboard",
        subtitle: "User activity and session details.",
        total: "Total Activities",
        latest: "Recent Unique Activities",
        noAccess: "You are not an admin.",
        empty: "No activity has been recorded yet.",
    };

  if (role !== "admin") {
    return (
      <section className="section-panel">
        <h1 className="section-title">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.noAccess}</p>
      </section>
    );
  }

  const counts = activities.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.action] = (accumulator[item.action] || 0) + 1;
    return accumulator;
  }, {});

  const uniqueActivities = Array.from(
    new Map(
      activities.map((item) => [`${item.role}|${item.path}|${item.action}|${item.meta || ""}`, item]),
    ).values(),
  ).slice(0, 50);

  return (
    <div className="space-y-6">
      <section className="section-panel">
        <h1 className="section-title">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.subtitle}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="section-panel">
          <p className="text-sm text-slate-500">{t.total}</p>
          <p className="mt-2 text-3xl font-bold text-[#2d6a4f]">{activities.length}</p>
        </div>
        {Object.entries(counts).slice(0, 3).map(([action, count]) => (
          <div key={action} className="section-panel">
            <p className="text-sm text-slate-500">{action}</p>
            <p className="mt-2 text-3xl font-bold text-[#2d6a4f]">{count}</p>
          </div>
        ))}
      </section>

      <section className="section-panel">
        <h2 className="text-xl font-semibold text-[#214d39]">{t.latest}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-emerald-100 text-slate-500">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Path</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Meta</th>
              </tr>
            </thead>
            <tbody>
              {uniqueActivities.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={5}>
                    {t.empty}
                  </td>
                </tr>
              ) : (
                uniqueActivities.map((item) => (
                  <tr key={item.id} className="border-b border-emerald-50">
                    <td className="px-3 py-2">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2">{item.role}</td>
                    <td className="px-3 py-2">{item.path}</td>
                    <td className="px-3 py-2">{item.action}</td>
                    <td className="px-3 py-2">{item.meta || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
