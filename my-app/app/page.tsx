"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Lang = "en" | "kn";
type ChatMessage = { role: "user" | "model"; text: string };
type ScannerResult = {
  detected: string;
  healthStatus: string;
  analysis: string;
  recommendations: string;
  confidence: string;
  raw: string;
};

type ChartInstance = { destroy: () => void };
type ChartCtor = new (canvas: HTMLCanvasElement, config: unknown) => ChartInstance;

declare global {
  interface Window {
    Chart?: ChartCtor;
  }
}

const text = {
  en: {
    home: "Home",
    life: "Life Cycle",
    seed: "Seed Preparation",
    rearing: "Rearing Methods",
    production: "Silk Production",
    market: "Market Prices",
    scanner: "AI Scanner",
    about: "About",
    hero: "Modern Silk Farming, Powered by AI",
    heroSub: "A practical platform for farmers, students, and beginners.",
    apiLabel: "Gemini API Key",
    apiPlaceholder: "Paste your Gemini API key",
    upload: "Upload Image",
    analyze: "Analyze with Gemini",
    analyzing: "Analyzing...",
    chat: "AI Chat",
    send: "Send",
    chatPlaceholder: "Ask about rearing, diseases, cocoon quality...",
    lang: "ಕನ್ನಡ",
  },
  kn: {
    home: "ಮುಖಪುಟ",
    life: "ಜೀವ ಚಕ್ರ",
    seed: "ಬೀಜ ಸಿದ್ಧತೆ",
    rearing: "ಪೋಷಣೆ ವಿಧಾನ",
    production: "ರೇಷ್ಮೆ ಉತ್ಪಾದನೆ",
    market: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
    scanner: "AI ಸ್ಕ್ಯಾನರ್",
    about: "ಬಗ್ಗೆ",
    hero: "ಆಧುನಿಕ ರೇಷ್ಮೆ ಕೃಷಿ, AI ನೆರವಿನಿಂದ",
    heroSub: "ರೈತರು, ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಆರಂಭಿಕರಿಗಾಗಿ ಉಪಯುಕ್ತ ವೇದಿಕೆ.",
    apiLabel: "Gemini API ಕೀ",
    apiPlaceholder: "ನಿಮ್ಮ Gemini API ಕೀ ನಮೂದಿಸಿ",
    upload: "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್",
    analyze: "Gemini ವಿಶ್ಲೇಷಣೆ",
    analyzing: "ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...",
    chat: "AI ಚಾಟ್",
    send: "ಕಳುಹಿಸಿ",
    chatPlaceholder: "ರೋಗ, ಪೋಷಣೆ, ಗುಣಮಟ್ಟ ಕುರಿತು ಕೇಳಿ...",
    lang: "English",
  },
};

const quickCards = [
  ["#life-cycle", "Silkworm Life Cycle"],
  ["#rearing", "Rearing Methods"],
  ["#seed", "Seed Preparation"],
  ["#production", "Silk Production"],
  ["#market", "Market Prices"],
  ["#scanner", "AI Image Scanner"],
];

const stages = [
  ["Egg", "8-10 days", "Incubate clean eggs at stable temperature and humidity."],
  ["Larva", "20-24 days", "Feed tender mulberry leaves frequently and keep trays clean."],
  ["Pupa", "10-14 days", "Cocoon stage; avoid moisture buildup and fungal exposure."],
  ["Moth", "4-6 days", "Select healthy breeders for the next seed cycle."],
];

const stats = [
  ["Annual Silk Output", 5400, " MT"],
  ["Registered Farmers", 18500, "+"],
  ["Training Centers", 126, ""],
  ["AI Advisory Accuracy", 94, "%"],
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error("Unable to read the image file."));
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("seri-key") || "";
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [scannerResult, setScannerResult] = useState<ScannerResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = sessionStorage.getItem("seri-chat");
    if (!saved) return [];
    try {
      return JSON.parse(saved) as ChatMessage[];
    } catch {
      return [];
    }
  });
  const [count, setCount] = useState<number[]>(stats.map(() => 0));

  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const t = useMemo(() => text[lang], [lang]);

  useEffect(() => sessionStorage.setItem("seri-key", apiKey), [apiKey]);
  useEffect(() => {
    sessionStorage.setItem("seri-chat", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("show"));
      },
      { threshold: 0.2 },
    );
    document.querySelectorAll(".fade-item").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = document.getElementById("stats");
    if (!target) return;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started) return;
        started = true;
        const start = performance.now();
        const duration = 1400;
        const frame = (time: number) => {
          const p = Math.min((time - start) / duration, 1);
          setCount(stats.map((s) => Math.floor((s[1] as number) * p)));
          if (p < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      },
      { threshold: 0.3 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const draw = async () => {
      if (!window.Chart) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/chart.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Chart.js failed to load"));
          document.body.appendChild(script);
        });
      }

      if (!chartCanvasRef.current) return;
      const ChartLib = window.Chart;
      if (!ChartLib) return;
      chartRef.current?.destroy();
      chartRef.current = new ChartLib(chartCanvasRef.current, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
          datasets: [
            {
              label: "Bivoltine Cocoon Price (Rs/kg)",
              data: [640, 655, 662, 678, 689, 704, 716, 724],
              borderColor: "#2d6a4f",
              backgroundColor: "rgba(45,106,79,0.15)",
              fill: true,
              tension: 0.35,
              borderWidth: 3,
            },
          ],
        },
      });
    };
    draw().catch(() => setScannerError("Chart load failed."));
    return () => chartRef.current?.destroy();
  }, []);

  const processImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setScannerError("Please upload a valid image file.");
      return;
    }
    setScannerError("");
    setScannerResult(null);
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const onAnalyze = async () => {
    if (!apiKey.trim()) return setScannerError("Please enter your Gemini API key.");
    if (!imageFile) return setScannerError("Please upload an image first.");

    setScannerLoading(true);
    setScannerError("");
    setScannerResult(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          imageBase64,
          mimeType: imageFile.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image analysis failed.");
      setScannerResult(data);
    } catch (err) {
      setScannerError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setScannerLoading(false);
    }
  };

  const onChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    if (!apiKey.trim()) return setScannerError("Please enter your Gemini API key.");

    const userMsg = { role: "user" as const, text: chatInput.trim() };
    const updated = [...chatHistory, userMsg];
    setChatHistory(updated);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, messages: updated }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed.");
      setChatHistory((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected chat error.";
      setChatHistory((prev) => [...prev, { role: "model", text: `Error: ${msg}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="relative">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(45,106,79,0.12),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(244,162,97,0.14),transparent_35%)]" />

      <nav className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <a href="#home" className="text-lg font-bold text-[#2d6a4f] md:text-xl">
            🌿 SmartSeri
          </a>
          <div className="hidden items-center gap-4 text-sm md:flex">
            <a href="#home" className="nav-link">{t.home}</a>
            <a href="#life-cycle" className="nav-link">{t.life}</a>
            <a href="#seed" className="nav-link">{t.seed}</a>
            <a href="#rearing" className="nav-link">{t.rearing}</a>
            <a href="#production" className="nav-link">{t.production}</a>
            <a href="#market" className="nav-link">{t.market}</a>
            <a href="#scanner" className="nav-link">{t.scanner}</a>
            <a href="#about" className="nav-link">{t.about}</a>
          </div>
          <button
            className="rounded-full bg-[#2d6a4f] px-3 py-2 text-xs font-semibold text-white md:text-sm"
            onClick={() => setLang((prev) => (prev === "en" ? "kn" : "en"))}
          >
            {t.lang}
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-14 px-4 py-8 md:px-6 md:py-12">
        <section id="home" className="fade-item rounded-3xl bg-white p-6 shadow-lg ring-1 ring-emerald-100 md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#214d39] md:text-5xl">{t.hero}</h1>
              <p className="mt-3 text-slate-600">{t.heroSub}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {quickCards.map(([href, label]) => (
                  <a key={href} href={href} className="rounded-xl bg-emerald-50 px-3 py-3 text-center text-xs font-medium text-emerald-800 ring-1 ring-emerald-100 transition hover:-translate-y-1">
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div id="stats" className="grid grid-cols-2 gap-4 rounded-3xl bg-[#2d6a4f] p-5 text-white">
              {stats.map((s, i) => (
                <div key={s[0] as string} className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl font-bold md:text-3xl">{count[i].toLocaleString()}{s[2] as string}</p>
                  <p className="mt-1 text-xs text-emerald-100">{s[0] as string}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="life-cycle" className="fade-item rounded-3xl bg-white p-6 shadow-md ring-1 ring-emerald-100 md:p-10">
          <h2 className="text-2xl font-semibold text-[#2d6a4f] md:text-3xl">Silkworm Life Cycle (Bombyx mori)</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {stages.map((stage, index) => (
              <article key={stage[0] as string} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-xs font-semibold text-emerald-700">Stage {index + 1}</p>
                <h3 className="mt-1 font-semibold text-[#2d6a4f]">{stage[0] as string}</h3>
                <p className="text-xs text-slate-500">Duration: {stage[1] as string}</p>
                <p className="mt-2 text-sm text-slate-700">{stage[2] as string}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="seed" className="fade-item rounded-3xl bg-white p-6 shadow-md ring-1 ring-emerald-100 md:p-10">
          <h2 className="text-2xl font-semibold text-[#2d6a4f] md:text-3xl">Seed Preparation Guide</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <ol className="space-y-2 text-sm text-slate-700">
              <li className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">1. Select disease-free layings from certified sources.</li>
              <li className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">2. Disinfect room, racks, and rearing appliances.</li>
              <li className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">3. Incubate eggs at 24-25°C and 80-85% humidity.</li>
              <li className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">4. Follow black-boxing schedule for synchronized hatching.</li>
              <li className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">5. Shift hatched larvae to feeding trays quickly.</li>
            </ol>
            <div className="space-y-4">
              <table className="w-full overflow-hidden rounded-xl text-sm ring-1 ring-emerald-100">
                <thead className="bg-[#2d6a4f] text-white">
                  <tr><th className="px-4 py-2 text-left">Parameter</th><th className="px-4 py-2 text-left">Value</th></tr>
                </thead>
                <tbody className="bg-white text-slate-700">
                  <tr className="border-t border-emerald-50"><td className="px-4 py-2">Temperature</td><td className="px-4 py-2">24-25°C</td></tr>
                  <tr className="border-t border-emerald-50"><td className="px-4 py-2">Humidity</td><td className="px-4 py-2">80-85%</td></tr>
                  <tr className="border-t border-emerald-50"><td className="px-4 py-2">Light</td><td className="px-4 py-2">Diffused</td></tr>
                  <tr className="border-t border-emerald-50"><td className="px-4 py-2">Ventilation</td><td className="px-4 py-2">Gentle</td></tr>
                </tbody>
              </table>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100"><p className="font-semibold text-emerald-700">Do&apos;s</p><p className="mt-1 text-sm text-slate-700">Use fresh leaves, sanitize trays, monitor hatch timing.</p></div>
                <div className="rounded-xl bg-orange-50 p-3 ring-1 ring-orange-100"><p className="font-semibold text-orange-700">Don&apos;ts</p><p className="mt-1 text-sm text-slate-700">Avoid stale feed, overcrowding, and direct sunlight.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="rearing" className="fade-item rounded-3xl bg-white p-6 shadow-md ring-1 ring-emerald-100 md:p-10">
          <h2 className="text-2xl font-semibold text-[#2d6a4f] md:text-3xl">Rearing Methods</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><p className="font-semibold text-[#2d6a4f]">Traditional</p><p className="mt-2 text-sm text-slate-700">Manual tray-based approach with local materials and natural ventilation.</p></div>
            <div className="rounded-xl bg-[#fff5eb] p-4 ring-1 ring-orange-100"><p className="font-semibold text-[#915729]">Modern</p><p className="mt-2 text-sm text-slate-700">Controlled rearing houses with monitored climate and better disease control.</p></div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-[#2d6a4f] p-4 text-sm text-emerald-100">Temperature: 24-28°C</div>
            <div className="rounded-xl bg-[#2d6a4f] p-4 text-sm text-emerald-100">Humidity: 70-85%</div>
            <div className="rounded-xl bg-[#2d6a4f] p-4 text-sm text-emerald-100">Mulberry feed: 4-5 times/day + strict hygiene</div>
          </div>
        </section>

        <section id="production" className="fade-item rounded-3xl bg-white p-6 shadow-md ring-1 ring-emerald-100 md:p-10">
          <h2 className="text-2xl font-semibold text-[#2d6a4f] md:text-3xl">Silk Production Process</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {["Cocoon", "Stifling", "Reeling", "Twisting", "Weaving"].map((step, i) => (
              <article key={step} className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-semibold text-emerald-700">STEP {i + 1}</p>
                <p className="mt-1 font-semibold text-[#2d6a4f]">{step}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-[#fff5eb] p-4 text-sm text-slate-700 ring-1 ring-orange-100">Quality grading focuses on shell ratio, filament length, color, and reelability.</p>
        </section>

        <section id="market" className="fade-item rounded-3xl bg-white p-6 shadow-md ring-1 ring-emerald-100 md:p-10">
          <h2 className="text-2xl font-semibold text-[#2d6a4f] md:text-3xl">Market Prices Dashboard</h2>
          <div className="mt-5 rounded-xl bg-white p-3 ring-1 ring-emerald-100"><canvas ref={chartCanvasRef} /></div>
          <div className="mt-5 overflow-x-auto rounded-xl ring-1 ring-emerald-100">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2d6a4f] text-white">
                <tr><th className="px-4 py-2 text-left">Region</th><th className="px-4 py-2 text-left">Bivoltine</th><th className="px-4 py-2 text-left">Multivoltine</th><th className="px-4 py-2 text-left">Waste Silk</th></tr>
              </thead>
              <tbody className="bg-white text-slate-700">
                <tr className="border-t border-emerald-50"><td className="px-4 py-2">Ramanagara</td><td className="px-4 py-2">720</td><td className="px-4 py-2">530</td><td className="px-4 py-2">340</td></tr>
                <tr className="border-t border-emerald-50"><td className="px-4 py-2">Mysuru</td><td className="px-4 py-2">705</td><td className="px-4 py-2">520</td><td className="px-4 py-2">325</td></tr>
                <tr className="border-t border-emerald-50"><td className="px-4 py-2">Kolar</td><td className="px-4 py-2">690</td><td className="px-4 py-2">505</td><td className="px-4 py-2">315</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <iframe title="Ramanagara market" className="h-64 w-full rounded-xl ring-1 ring-emerald-100" src="https://maps.google.com/maps?q=Ramanagara%20Silk%20Market&t=&z=11&ie=UTF8&iwloc=&output=embed" loading="lazy" />
            <iframe title="Mysuru market" className="h-64 w-full rounded-xl ring-1 ring-emerald-100" src="https://maps.google.com/maps?q=Mysuru%20Silk%20Market&t=&z=11&ie=UTF8&iwloc=&output=embed" loading="lazy" />
          </div>
        </section>

        <section id="scanner" className="fade-item rounded-3xl bg-white p-6 shadow-md ring-1 ring-emerald-100 md:p-10">
          <h2 className="text-2xl font-semibold text-[#2d6a4f] md:text-3xl">AI Image Scanner</h2>
          <p className="mt-2 text-sm text-slate-600">Upload silkworm, cocoon, mulberry leaf, or rearing-house image for AI advice.</p>
          <label className="mt-5 block text-sm font-medium text-slate-700">
            {t.apiLabel}
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder={t.apiPlaceholder} className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); processImage(e.dataTransfer.files?.[0]); }} className="mt-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5 text-center">
            <p className="text-sm text-slate-600">Drag and drop image here, or upload manually.</p>
            <label className="mt-3 inline-block cursor-pointer rounded-full bg-[#2d6a4f] px-4 py-2 text-sm font-semibold text-white">
              {t.upload}
              <input className="hidden" type="file" accept="image/*" onChange={(e) => processImage(e.target.files?.[0])} />
            </label>
          </div>
          {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 max-h-80 w-full rounded-xl object-cover ring-1 ring-emerald-100" />}
          <button onClick={onAnalyze} disabled={scannerLoading} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f4a261] px-6 py-3 text-sm font-semibold text-[#43240f] disabled:opacity-60">
            {scannerLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#43240f] border-t-transparent" />}
            {scannerLoading ? t.analyzing : t.analyze}
          </button>
          {scannerError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{scannerError}</p>}
          {scannerResult && (
            <div className="mt-4 space-y-2 rounded-xl bg-emerald-50 p-4 text-sm text-slate-700 ring-1 ring-emerald-100">
              <p><b>Detected:</b> {scannerResult.detected}</p>
              <p><b>Health Status:</b> {scannerResult.healthStatus}</p>
              <p><b>Analysis:</b> {scannerResult.analysis}</p>
              <p><b>Recommendations:</b> {scannerResult.recommendations}</p>
              <p><b>Confidence:</b> {scannerResult.confidence}</p>
              <details className="rounded-lg bg-white p-3 ring-1 ring-emerald-100">
                <summary className="cursor-pointer font-medium text-[#2d6a4f]">Raw model response</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">{scannerResult.raw}</pre>
              </details>
            </div>
          )}
        </section>

        <section id="about" className="fade-item rounded-3xl bg-white p-6 shadow-md ring-1 ring-emerald-100 md:p-10">
          <h2 className="text-2xl font-semibold text-[#2d6a4f] md:text-3xl">About</h2>
          <p className="mt-2 text-slate-700">Smart Sericulture System was built as an informative and AI-powered learning platform.</p>
          <p className="mt-2 text-slate-700"><b>College:</b> KLE GH BCA College Haveri</p>
          <p className="mt-2 text-slate-700"><b>Team:</b> Student developers and mentors</p>
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-slate-700 ring-1 ring-emerald-100">
            <p className="font-semibold text-emerald-700">References</p>
            <p><a className="underline" href="https://csb.gov.in/" target="_blank" rel="noreferrer">Central Silk Board</a></p>
            <p><a className="underline" href="https://www.fao.org/" target="_blank" rel="noreferrer">FAO Agriculture</a></p>
            <p><a className="underline" href="https://ai.google.dev/" target="_blank" rel="noreferrer">Google AI Docs</a></p>
          </div>
        </section>
      </main>

      <button onClick={() => setChatOpen((prev) => !prev)} className="fixed bottom-5 right-5 z-50 rounded-full bg-[#2d6a4f] px-5 py-3 text-sm font-semibold text-white shadow-lg">
        <i className="fa-solid fa-comment-dots mr-2" />
        {t.chat}
      </button>

      {chatOpen && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-emerald-200 md:right-5">
          <div className="bg-[#2d6a4f] px-4 py-3 text-sm font-semibold text-white">Sericulture Assistant</div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-emerald-50/60 p-3">
            {chatHistory.length === 0 && <p className="rounded-lg bg-white p-3 text-xs text-slate-500">Ask anything about sericulture, rearing, prices, or disease prevention.</p>}
            {chatHistory.map((m, i) => (
              <div key={`${m.role}-${i}`} className={`max-w-[86%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-[#2d6a4f] text-white" : "bg-white text-slate-700"}`}>
                {m.text}
              </div>
            ))}
            {chatLoading && <div className="max-w-[86%] rounded-lg bg-white px-3 py-2 text-sm text-slate-500">Thinking...</div>}
          </div>
          <form onSubmit={onChat} className="flex gap-2 border-t border-emerald-100 p-3">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={t.chatPlaceholder} className="flex-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            <button className="rounded-lg bg-[#f4a261] px-4 py-2 text-sm font-semibold text-[#43240f]" type="submit">{t.send}</button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .fade-item { opacity: 0; transform: translateY(26px); transition: all 0.65s ease; }
        .fade-item.show { opacity: 1; transform: translateY(0); }
        .nav-link { color: #2d6a4f; font-weight: 500; transition: color .2s; }
        .nav-link:hover { color: #f4a261; }
      `}</style>
    </div>
  );
}
