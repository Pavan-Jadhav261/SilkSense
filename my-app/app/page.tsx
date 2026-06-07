"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Lang = "en" | "kn";
type AuthMode = "login" | "register";
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

const copy = {
  en: {
    brand: "SmartSeri",
    home: "Home",
    life: "Life Cycle",
    seed: "Seed",
    rearing: "Rearing",
    production: "Production",
    market: "Market",
    scanner: "AI Scanner",
    about: "About",
    login: "Login",
    register: "Register",
    logout: "Logout",
    langButton: "ಕನ್ನಡ",
    hero: "Smart Sericulture Support",
    heroSub: "AI guidance for silk farmers, students, and beginners.",
    quickTitle: "Explore",
    username: "Username",
    password: "Password",
    confirmPassword: "Confirm password",
    authHint: "Use admin and 1234 for this dummy account.",
    loginTitle: "Dummy Login",
    registerTitle: "Dummy Register",
    authButton: "Continue",
    authError: "Use username admin and password 1234.",
    registerError: "Enter admin, 1234, and matching confirm password.",
    authSuccess: "Logged in as admin",
    apiLabel: "Gemini API Key",
    apiPlaceholder: "Paste your Gemini API key",
    upload: "Upload Image",
    analyze: "Analyze with Gemini",
    analyzing: "Analyzing...",
    chat: "AI Chat",
    assistant: "Sericulture Assistant",
    send: "Send",
    thinking: "Thinking...",
    chatEmpty: "Ask anything about sericulture, rearing, prices, or disease prevention.",
    chatPlaceholder: "Ask about rearing, diseases, cocoon quality...",
    missingKey: "Please enter your Gemini API key.",
    imageRequired: "Please upload an image first.",
    imageInvalid: "Please upload a valid image file.",
    chartError: "Chart load failed.",
    scannerIntro: "Upload a silkworm, cocoon, mulberry leaf, or rearing-house image for AI advice.",
    dropText: "Drag and drop an image here, or upload manually.",
    detected: "Detected",
    healthStatus: "Health Status",
    analysis: "Analysis",
    recommendations: "Recommendations",
    confidence: "Confidence",
    raw: "Raw model response",
    lifeTitle: "Silkworm Life Cycle",
    seedTitle: "Seed Preparation Guide",
    rearingTitle: "Rearing Methods",
    productionTitle: "Silk Production Process",
    marketTitle: "Market Prices Dashboard",
    aboutTitle: "About",
    aboutText: "Smart Sericulture System is an informative and AI-powered learning platform.",
    college: "College",
    team: "Team",
    references: "References",
    statLabels: ["Annual Silk Output", "Registered Farmers", "Training Centers", "AI Advisory Accuracy"],
    stageLabel: "Stage",
    duration: "Duration",
    stages: [
      ["Egg", "8-10 days", "Incubate clean eggs at stable temperature and humidity."],
      ["Larva", "20-24 days", "Feed tender mulberry leaves frequently and keep trays clean."],
      ["Pupa", "10-14 days", "Cocoon stage; avoid moisture buildup and fungal exposure."],
      ["Moth", "4-6 days", "Select healthy breeders for the next seed cycle."],
    ],
    seedSteps: [
      "Select disease-free layings from certified sources.",
      "Disinfect room, racks, and rearing appliances.",
      "Incubate eggs at 24-25°C and 80-85% humidity.",
      "Follow black-boxing schedule for synchronized hatching.",
      "Shift hatched larvae to feeding trays quickly.",
    ],
    params: ["Parameter", "Value", "Temperature", "Humidity", "Light", "Diffused", "Ventilation", "Gentle"],
    dos: "Do's",
    donts: "Don'ts",
    dosText: "Use fresh leaves, sanitize trays, monitor hatch timing.",
    dontsText: "Avoid stale feed, overcrowding, and direct sunlight.",
    traditional: "Traditional",
    traditionalText: "Manual tray-based approach with local materials and natural ventilation.",
    modern: "Modern",
    modernText: "Controlled rearing houses with monitored climate and better disease control.",
    conditions: ["Temperature: 24-28°C", "Humidity: 70-85%", "Mulberry feed: 4-5 times/day + strict hygiene"],
    productionSteps: ["Cocoon", "Stifling", "Reeling", "Twisting", "Weaving"],
    gradeText: "Quality grading focuses on shell ratio, filament length, color, and reelability.",
    tableHead: ["Region", "Bivoltine", "Multivoltine", "Waste Silk"],
  },
  kn: {
    brand: "ಸ್ಮಾರ್ಟ್ ಸೇರಿ",
    home: "ಮುಖಪುಟ",
    life: "ಜೀವನ ಚಕ್ರ",
    seed: "ಬೀಜ",
    rearing: "ಸಾಕಣೆ",
    production: "ಉತ್ಪಾದನೆ",
    market: "ಮಾರುಕಟ್ಟೆ",
    scanner: "AI ಸ್ಕ್ಯಾನರ್",
    about: "ಬಗ್ಗೆ",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    logout: "ಲಾಗೌಟ್",
    langButton: "English",
    hero: "ಸ್ಮಾರ್ಟ್ ರೇಷ್ಮೆ ಕೃಷಿ ಸಹಾಯ",
    heroSub: "ರೇಷ್ಮೆ ರೈತರು, ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಆರಂಭಿಕರಿಗೆ AI ಮಾರ್ಗದರ್ಶನ.",
    quickTitle: "ಅನ್ವೇಷಿಸಿ",
    username: "ಬಳಕೆದಾರ ಹೆಸರು",
    password: "ಪಾಸ್ವರ್ಡ್",
    confirmPassword: "ಪಾಸ್ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ",
    authHint: "ಈ ಡಮ್ಮಿ ಖಾತೆಗೆ admin ಮತ್ತು 1234 ಬಳಸಿ.",
    loginTitle: "ಡಮ್ಮಿ ಲಾಗಿನ್",
    registerTitle: "ಡಮ್ಮಿ ನೋಂದಣಿ",
    authButton: "ಮುಂದುವರಿಸಿ",
    authError: "ಬಳಕೆದಾರ ಹೆಸರು admin ಮತ್ತು ಪಾಸ್ವರ್ಡ್ 1234 ಬಳಸಿ.",
    registerError: "admin, 1234 ಮತ್ತು ಹೊಂದುವ ಖಚಿತ ಪಾಸ್ವರ್ಡ್ ನಮೂದಿಸಿ.",
    authSuccess: "admin ಆಗಿ ಲಾಗಿನ್ ಆಗಿದೆ",
    apiLabel: "Gemini API ಕೀ",
    apiPlaceholder: "ನಿಮ್ಮ Gemini API ಕೀ ಅಂಟಿಸಿ",
    upload: "ಚಿತ್ರ ಅಪ್ಲೋಡ್",
    analyze: "Gemini ಮೂಲಕ ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    chat: "AI ಚಾಟ್",
    assistant: "ರೇಷ್ಮೆ ಸಹಾಯಕ",
    send: "ಕಳುಹಿಸಿ",
    thinking: "ಯೋಚಿಸುತ್ತಿದೆ...",
    chatEmpty: "ರೇಷ್ಮೆ ಕೃಷಿ, ಸಾಕಣೆ, ಬೆಲೆಗಳು ಅಥವಾ ರೋಗ ತಡೆ ಬಗ್ಗೆ ಕೇಳಿ.",
    chatPlaceholder: "ಸಾಕಣೆ, ರೋಗಗಳು, ಕೋಕೂನ್ ಗುಣಮಟ್ಟದ ಬಗ್ಗೆ ಕೇಳಿ...",
    missingKey: "ದಯವಿಟ್ಟು ನಿಮ್ಮ Gemini API ಕೀ ನಮೂದಿಸಿ.",
    imageRequired: "ಮೊದಲು ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ.",
    imageInvalid: "ಸರಿಯಾದ ಚಿತ್ರ ಫೈಲ್ ಅಪ್ಲೋಡ್ ಮಾಡಿ.",
    chartError: "ಚಾರ್ಟ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ.",
    scannerIntro: "ರೇಷ್ಮೆ ಹುಳು, ಕೋಕೂನ್, ಮಲ್ಬೆರಿ ಎಲೆ ಅಥವಾ ಸಾಕಣೆ ಮನೆಯ ಚಿತ್ರವನ್ನು AI ಸಲಹೆಗೆ ಅಪ್ಲೋಡ್ ಮಾಡಿ.",
    dropText: "ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ, ಅಥವಾ ಕೈಯಾರೆ ಅಪ್ಲೋಡ್ ಮಾಡಿ.",
    detected: "ಗುರುತಿಸಲಾಗಿದೆ",
    healthStatus: "ಆರೋಗ್ಯ ಸ್ಥಿತಿ",
    analysis: "ವಿಶ್ಲೇಷಣೆ",
    recommendations: "ಶಿಫಾರಸುಗಳು",
    confidence: "ವಿಶ್ವಾಸ",
    raw: "ಮೂಲ ಮಾದರಿ ಪ್ರತಿಕ್ರಿಯೆ",
    lifeTitle: "ರೇಷ್ಮೆ ಹುಳಿನ ಜೀವನ ಚಕ್ರ",
    seedTitle: "ಬೀಜ ಸಿದ್ಧತಾ ಮಾರ್ಗದರ್ಶಿ",
    rearingTitle: "ಸಾಕಣೆ ವಿಧಾನಗಳು",
    productionTitle: "ರೇಷ್ಮೆ ಉತ್ಪಾದನಾ ಪ್ರಕ್ರಿಯೆ",
    marketTitle: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಫಲಕ",
    aboutTitle: "ಬಗ್ಗೆ",
    aboutText: "ಸ್ಮಾರ್ಟ್ ಸೆರಿಕಲ್ಚರ್ ಸಿಸ್ಟಮ್ ಮಾಹಿತಿ ಮತ್ತು AI ಆಧಾರಿತ ಕಲಿಕಾ ವೇದಿಕೆಯಾಗಿದೆ.",
    college: "ಕಾಲೇಜು",
    team: "ತಂಡ",
    references: "ಉಲ್ಲೇಖಗಳು",
    statLabels: ["ವಾರ್ಷಿಕ ರೇಷ್ಮೆ ಉತ್ಪಾದನೆ", "ನೋಂದಾಯಿತ ರೈತರು", "ತರಬೇತಿ ಕೇಂದ್ರಗಳು", "AI ಸಲಹೆ ನಿಖರತೆ"],
    stageLabel: "ಹಂತ",
    duration: "ಅವಧಿ",
    stages: [
      ["ಮೊಟ್ಟೆ", "8-10 ದಿನ", "ಸ್ವಚ್ಛ ಮೊಟ್ಟೆಗಳನ್ನು ಸ್ಥಿರ ತಾಪಮಾನ ಮತ್ತು ಆರ್ದ್ರತೆಯಲ್ಲಿ ಇಡಿ."],
      ["ಲಾರ್ವಾ", "20-24 ದಿನ", "ತಾಜಾ ಮಲ್ಬೆರಿ ಎಲೆಗಳನ್ನು ಆಗಾಗ ನೀಡಿ ಮತ್ತು ಟ್ರೇಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ."],
      ["ಪ್ಯೂಪಾ", "10-14 ದಿನ", "ಕೋಕೂನ್ ಹಂತದಲ್ಲಿ ತೇವಾಂಶ ಮತ್ತು ಫಂಗಸ್ ತಪ್ಪಿಸಿ."],
      ["ಚಿಟ್ಟೆ", "4-6 ದಿನ", "ಮುಂದಿನ ಬೀಜ ಚಕ್ರಕ್ಕೆ ಆರೋಗ್ಯಕರ ಜಾತಿಗಳನ್ನು ಆರಿಸಿ."],
    ],
    seedSteps: [
      "ಪ್ರಮಾಣಿತ ಮೂಲಗಳಿಂದ ರೋಗರಹಿತ ಮೊಟ್ಟೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      "ಕೊಠಡಿ, ರ್ಯಾಕ್ ಮತ್ತು ಸಾಕಣೆ ಉಪಕರಣಗಳನ್ನು ಸೋಂಕುರಹಿತಗೊಳಿಸಿ.",
      "24-25°C ಮತ್ತು 80-85% ಆರ್ದ್ರತೆಯಲ್ಲಿ ಮೊಟ್ಟೆಗಳನ್ನು ಇಡಿ.",
      "ಒಟ್ಟಿಗೆ ಹೊರಬರುವಂತೆ ಬ್ಲಾಕ್-ಬಾಕ್ಸಿಂಗ್ ವೇಳಾಪಟ್ಟಿ ಪಾಲಿಸಿ.",
      "ಹೊರಬಂದ ಲಾರ್ವಾಗಳನ್ನು ಬೇಗ ಆಹಾರ ಟ್ರೇಗಳಿಗೆ ಹಾಕಿ.",
    ],
    params: ["ಅಂಶ", "ಮೌಲ್ಯ", "ತಾಪಮಾನ", "ಆರ್ದ್ರತೆ", "ಬೆಳಕು", "ಮಂದ ಬೆಳಕು", "ಗಾಳಿ", "ಮೃದುವಾದ"],
    dos: "ಮಾಡಬೇಕಾದುದು",
    donts: "ಮಾಡಬಾರದು",
    dosText: "ತಾಜಾ ಎಲೆ ಬಳಸಿ, ಟ್ರೇ ಸ್ವಚ್ಛಗೊಳಿಸಿ, ಹೊರಬರುವ ಸಮಯ ಗಮನಿಸಿ.",
    dontsText: "ಹಳೆಯ ಆಹಾರ, ಅತಿಯಾಗಿ ತುಂಬಿಸುವುದು ಮತ್ತು ನೇರ ಸೂರ್ಯಬೆಳಕು ತಪ್ಪಿಸಿ.",
    traditional: "ಪಾರಂಪರಿಕ",
    traditionalText: "ಸ್ಥಳೀಯ ವಸ್ತುಗಳು ಮತ್ತು ನೈಸರ್ಗಿಕ ಗಾಳಿಯೊಂದಿಗೆ ಕೈಯಾರೆ ಟ್ರೇ ಆಧಾರಿತ ವಿಧಾನ.",
    modern: "ಆಧುನಿಕ",
    modernText: "ನಿಯಂತ್ರಿತ ಹವಾಮಾನ ಮತ್ತು ಉತ್ತಮ ರೋಗ ನಿಯಂತ್ರಣ ಇರುವ ಸಾಕಣೆ ಮನೆಗಳು.",
    conditions: ["ತಾಪಮಾನ: 24-28°C", "ಆರ್ದ್ರತೆ: 70-85%", "ಮಲ್ಬೆರಿ ಆಹಾರ: ದಿನಕ್ಕೆ 4-5 ಬಾರಿ + ಕಟ್ಟುನಿಟ್ಟಾದ ಸ್ವಚ್ಛತೆ"],
    productionSteps: ["ಕೋಕೂನ್", "ಸ್ಟಿಫ್ಲಿಂಗ್", "ರೀಲಿಂಗ್", "ಟ್ವಿಸ್ಟಿಂಗ್", "ನೇಯ್ಗೆ"],
    gradeText: "ಗುಣಮಟ್ಟದ ಶ್ರೇಣಿಯಲ್ಲಿ ಶೆಲ್ ಅನುಪಾತ, ತಂತು ಉದ್ದ, ಬಣ್ಣ ಮತ್ತು ರೀಲಿಂಗ್ ಸಾಮರ್ಥ್ಯ ನೋಡಲಾಗುತ್ತದೆ.",
    tableHead: ["ಪ್ರದೇಶ", "ಬೈವೋಲ್ಟಿನ್", "ಮಲ್ಟಿವೋಲ್ಟಿನ್", "ವೇಸ್ಟ್ ಸಿಲ್ಕ್"],
  },
};

const stats = [
  [5400, " MT"],
  [18500, "+"],
  [126, ""],
  [94, "%"],
];

const quickLinks = [
  ["#life-cycle", "life"],
  ["#seed", "seed"],
  ["#rearing", "rearing"],
  ["#production", "production"],
  ["#market", "market"],
  ["#scanner", "scanner"],
] as const;

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
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [scannerResult, setScannerResult] = useState<ScannerResult | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [count, setCount] = useState<number[]>(stats.map(() => 0));

  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const t = useMemo(() => copy[lang], [lang]);

  useEffect(() => {
    setIsLoggedIn(sessionStorage.getItem("seri-auth") === "true");
    const saved = sessionStorage.getItem("seri-chat");
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved) as ChatMessage[]);
      } catch {
        setChatHistory([]);
      }
    }
  }, []);

  useEffect(() => sessionStorage.setItem("seri-chat", JSON.stringify(chatHistory)), [chatHistory]);
  useEffect(() => document.documentElement.setAttribute("lang", lang === "kn" ? "kn" : "en"), [lang]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("show")),
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
          const progress = Math.min((time - start) / duration, 1);
          setCount(stats.map((stat) => Math.floor(stat[0] * progress)));
          if (progress < 1) requestAnimationFrame(frame);
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
          script.onerror = () => reject(new Error(t.chartError));
          document.body.appendChild(script);
        });
      }

      if (!chartCanvasRef.current || !window.Chart) return;
      chartRef.current?.destroy();
      chartRef.current = new window.Chart(chartCanvasRef.current, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
          datasets: [
            {
              label: lang === "kn" ? "ಬೈವೋಲ್ಟಿನ್ ಕೋಕೂನ್ ಬೆಲೆ (₹/kg)" : "Bivoltine Cocoon Price (₹/kg)",
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
    draw().catch(() => setScannerError(t.chartError));
    return () => chartRef.current?.destroy();
  }, [lang, t.chartError]);

  const handleAuth = (event: FormEvent) => {
    event.preventDefault();
    const validLogin = username.trim() === "admin" && password === "1234";
    const validRegister = validLogin && confirmPassword === "1234";

    if ((authMode === "login" && !validLogin) || (authMode === "register" && !validRegister)) {
      setAuthError(authMode === "login" ? t.authError : t.registerError);
      return;
    }

    setAuthError("");
    setIsLoggedIn(true);
    sessionStorage.setItem("seri-auth", "true");
  };

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("seri-auth");
  };

  const processImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setScannerError(t.imageInvalid);
      return;
    }
    setScannerError("");
    setScannerResult(null);
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const onAnalyze = async () => {
    if (!imageFile) return setScannerError(t.imageRequired);

    setScannerLoading(true);
    setScannerError("");
    setScannerResult(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: imageFile.type }),
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

  const onChat = async (event: FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: "user" as const, text: chatInput.trim() };
    const updated = [...chatHistory, userMessage];
    setChatHistory(updated);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, language: lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed.");
      setChatHistory((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected chat error.";
      setChatHistory((prev) => [...prev, { role: "model", text: `Error: ${message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="relative">
      <nav className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <a href="#home" className="text-lg font-bold text-[#2d6a4f] md:text-xl">
            {t.brand}
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
          <div className="flex items-center gap-2">
            {isLoggedIn && <span className="hidden text-xs font-semibold text-emerald-700 sm:inline">{t.authSuccess}</span>}
            <button className="rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#2d6a4f]" onClick={() => setLang((prev) => (prev === "en" ? "kn" : "en"))}>
              {t.langButton}
            </button>
            {isLoggedIn && (
              <button className="rounded-full bg-[#2d6a4f] px-3 py-2 text-xs font-semibold text-white" onClick={logout}>
                {t.logout}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 md:px-6 md:py-12">
        <section id="home" className="fade-item grid gap-6 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-emerald-100 md:grid-cols-[1.3fr_0.7fr] md:p-10">
          <div>
            <h1 className="text-3xl font-bold text-[#214d39] md:text-5xl">{t.hero}</h1>
            <p className="mt-3 text-slate-600">{t.heroSub}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickLinks.map(([href, key]) => (
                <a key={href} href={href} className="rounded-xl bg-emerald-50 px-3 py-3 text-center text-xs font-medium text-emerald-800 ring-1 ring-emerald-100 transition hover:-translate-y-1">
                  {t[key]}
                </a>
              ))}
            </div>
            <div id="stats" className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-[#2d6a4f] p-5 text-white">
              {stats.map((stat, index) => (
                <div key={t.statLabels[index]} className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl font-bold md:text-3xl">{count[index].toLocaleString()}{stat[1]}</p>
                  <p className="mt-1 text-xs text-emerald-100">{t.statLabels[index]}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAuth} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="mb-4 flex rounded-full bg-white p-1">
              {(["login", "register"] as AuthMode[]).map((mode) => (
                <button key={mode} type="button" onClick={() => { setAuthMode(mode); setAuthError(""); }} className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${authMode === mode ? "bg-[#2d6a4f] text-white" : "text-emerald-800"}`}>
                  {mode === "login" ? t.login : t.register}
                </button>
              ))}
            </div>
            <h2 className="text-xl font-semibold text-[#214d39]">{authMode === "login" ? t.loginTitle : t.registerTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">{t.authHint}</p>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              {t.username}
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="username" />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700">
              {t.password}
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none focus:border-emerald-500" autoComplete={authMode === "login" ? "current-password" : "new-password"} />
            </label>
            {authMode === "register" && (
              <label className="mt-3 block text-sm font-medium text-slate-700">
                {t.confirmPassword}
                <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="mt-2 w-full rounded-xl border border-emerald-200 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="new-password" />
              </label>
            )}
            {authError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{authError}</p>}
            <button className="mt-4 w-full rounded-xl bg-[#f4a261] px-4 py-3 text-sm font-bold text-[#43240f]" type="submit">
              {t.authButton}
            </button>
          </form>
        </section>

        <section id="life-cycle" className="fade-item section-panel">
          <h2 className="section-title">{t.lifeTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {t.stages.map((stage, index) => (
              <article key={stage[0]} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-xs font-semibold text-emerald-700">{t.stageLabel} {index + 1}</p>
                <h3 className="mt-1 font-semibold text-[#2d6a4f]">{stage[0]}</h3>
                <p className="text-xs text-slate-500">{t.duration}: {stage[1]}</p>
                <p className="mt-2 text-sm text-slate-700">{stage[2]}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="seed" className="fade-item section-panel">
          <h2 className="section-title">{t.seedTitle}</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <ol className="space-y-2 text-sm text-slate-700">
              {t.seedSteps.map((step, index) => (
                <li key={step} className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">{index + 1}. {step}</li>
              ))}
            </ol>
            <div className="space-y-4">
              <table className="w-full overflow-hidden rounded-xl text-sm ring-1 ring-emerald-100">
                <thead className="bg-[#2d6a4f] text-white">
                  <tr><th className="px-4 py-2 text-left">{t.params[0]}</th><th className="px-4 py-2 text-left">{t.params[1]}</th></tr>
                </thead>
                <tbody className="bg-white text-slate-700">
                  <tr><td className="px-4 py-2">{t.params[2]}</td><td className="px-4 py-2">24-25°C</td></tr>
                  <tr><td className="px-4 py-2">{t.params[3]}</td><td className="px-4 py-2">80-85%</td></tr>
                  <tr><td className="px-4 py-2">{t.params[4]}</td><td className="px-4 py-2">{t.params[5]}</td></tr>
                  <tr><td className="px-4 py-2">{t.params[6]}</td><td className="px-4 py-2">{t.params[7]}</td></tr>
                </tbody>
              </table>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100"><p className="font-semibold text-emerald-700">{t.dos}</p><p className="mt-1 text-sm text-slate-700">{t.dosText}</p></div>
                <div className="rounded-xl bg-orange-50 p-3 ring-1 ring-orange-100"><p className="font-semibold text-orange-700">{t.donts}</p><p className="mt-1 text-sm text-slate-700">{t.dontsText}</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="rearing" className="fade-item section-panel">
          <h2 className="section-title">{t.rearingTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><p className="font-semibold text-[#2d6a4f]">{t.traditional}</p><p className="mt-2 text-sm text-slate-700">{t.traditionalText}</p></div>
            <div className="rounded-xl bg-[#fff5eb] p-4 ring-1 ring-orange-100"><p className="font-semibold text-[#915729]">{t.modern}</p><p className="mt-2 text-sm text-slate-700">{t.modernText}</p></div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {t.conditions.map((condition) => <div key={condition} className="rounded-xl bg-[#2d6a4f] p-4 text-sm text-emerald-100">{condition}</div>)}
          </div>
        </section>

        <section id="production" className="fade-item section-panel">
          <h2 className="section-title">{t.productionTitle}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {t.productionSteps.map((step, index) => (
              <article key={step} className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-semibold text-emerald-700">STEP {index + 1}</p>
                <p className="mt-1 font-semibold text-[#2d6a4f]">{step}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-[#fff5eb] p-4 text-sm text-slate-700 ring-1 ring-orange-100">{t.gradeText}</p>
        </section>

        <section id="market" className="fade-item section-panel">
          <h2 className="section-title">{t.marketTitle}</h2>
          <div className="mt-5 rounded-xl bg-white p-3 ring-1 ring-emerald-100"><canvas ref={chartCanvasRef} /></div>
          <div className="mt-5 overflow-x-auto rounded-xl ring-1 ring-emerald-100">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2d6a4f] text-white">
                <tr>{t.tableHead.map((head) => <th key={head} className="px-4 py-2 text-left">{head}</th>)}</tr>
              </thead>
              <tbody className="bg-white text-slate-700">
                {["Ramanagara", "Mysuru", "Kolar"].map((region, index) => (
                  <tr key={region} className="border-t border-emerald-50">
                    <td className="px-4 py-2">{region}</td><td className="px-4 py-2">{[720, 705, 690][index]}</td><td className="px-4 py-2">{[530, 520, 505][index]}</td><td className="px-4 py-2">{[340, 325, 315][index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="scanner" className="fade-item section-panel">
          <h2 className="section-title">{t.scanner}</h2>
          <p className="mt-2 text-sm text-slate-600">{t.scannerIntro}</p>
          <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); processImage(event.dataTransfer.files?.[0]); }} className="mt-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5 text-center">
            <p className="text-sm text-slate-600">{t.dropText}</p>
            <label className="mt-3 inline-block cursor-pointer rounded-full bg-[#2d6a4f] px-4 py-2 text-sm font-semibold text-white">
              {t.upload}
              <input className="hidden" type="file" accept="image/*" onChange={(event) => processImage(event.target.files?.[0])} />
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
              <p><b>{t.detected}:</b> {scannerResult.detected}</p>
              <p><b>{t.healthStatus}:</b> {scannerResult.healthStatus}</p>
              <p><b>{t.analysis}:</b> {scannerResult.analysis}</p>
              <p><b>{t.recommendations}:</b> {scannerResult.recommendations}</p>
              <p><b>{t.confidence}:</b> {scannerResult.confidence}</p>
              <details className="rounded-lg bg-white p-3 ring-1 ring-emerald-100">
                <summary className="cursor-pointer font-medium text-[#2d6a4f]">{t.raw}</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">{scannerResult.raw}</pre>
              </details>
            </div>
          )}
        </section>

        <section id="about" className="fade-item section-panel">
          <h2 className="section-title">{t.aboutTitle}</h2>
          <p className="mt-2 text-slate-700">{t.aboutText}</p>
          <p className="mt-2 text-slate-700"><b>{t.college}:</b> KLE GH BCA College Haveri</p>
          <p className="mt-2 text-slate-700"><b>{t.team}:</b> Student developers and mentors</p>
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-slate-700 ring-1 ring-emerald-100">
            <p className="font-semibold text-emerald-700">{t.references}</p>
            <p><a className="underline" href="https://csb.gov.in/" target="_blank" rel="noreferrer">Central Silk Board</a></p>
            <p><a className="underline" href="https://ai.google.dev/" target="_blank" rel="noreferrer">Google AI Docs</a></p>
          </div>
        </section>
      </main>

      <button onClick={() => setChatOpen((prev) => !prev)} className="fixed bottom-5 right-5 z-50 rounded-full bg-[#2d6a4f] px-5 py-3 text-sm font-semibold text-white shadow-lg">
        {t.chat}
      </button>

      {chatOpen && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[28rem] w-[calc(100vw-2rem)] max-w-[22rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-emerald-200 md:right-5">
          <div className="bg-[#2d6a4f] px-4 py-3 text-sm font-semibold text-white">{t.assistant}</div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-emerald-50/60 p-3">
            {chatHistory.length === 0 && <p className="rounded-lg bg-white p-3 text-xs text-slate-500">{t.chatEmpty}</p>}
            {chatHistory.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`max-w-[86%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-[#2d6a4f] text-white" : "bg-white text-slate-700"}`}>
                {message.text}
              </div>
            ))}
            {chatLoading && <div className="max-w-[86%] rounded-lg bg-white px-3 py-2 text-sm text-slate-500">{t.thinking}</div>}
          </div>
          <form onSubmit={onChat} className="flex gap-2 border-t border-emerald-100 p-3">
            <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder={t.chatPlaceholder} className="min-w-0 flex-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            <button className="rounded-lg bg-[#f4a261] px-4 py-2 text-sm font-semibold text-[#43240f]" type="submit">{t.send}</button>
          </form>
        </div>
      )}

      <style jsx global>{`
        .fade-item { opacity: 0; transform: translateY(26px); transition: all 0.65s ease; }
        .fade-item.show { opacity: 1; transform: translateY(0); }
        .nav-link { color: #2d6a4f; font-weight: 500; transition: color .2s; }
        .nav-link:hover { color: #f4a261; }
        .section-panel { border-radius: 1.5rem; background: white; padding: 1.5rem; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid rgb(209 250 229); }
        .section-title { font-size: 1.5rem; line-height: 2rem; font-weight: 600; color: #2d6a4f; }
        @media (min-width: 768px) {
          .section-panel { padding: 2.5rem; }
          .section-title { font-size: 1.875rem; line-height: 2.25rem; }
        }
      `}</style>
    </div>
  );
}
