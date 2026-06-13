"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useApp } from "../../providers";

type LearningVideo = {
  id: string;
  title: string;
  channel: string;
  category: string;
  description: string;
  duration: string;
  source: "youtube" | "khanacademy" | "web";
  href: string;
};

type ScannerResult = {
  detected: string;
  healthStatus: string;
  analysis: string;
  recommendations: string;
  confidence: string;
  raw: string;
};

const videos: LearningVideo[] = [
  { id: "77ktNSPFbwQ", title: "Sericulture Production of Silk", channel: "YouTube", category: "Silk Processing", description: "Overview of silk production from silkworm to thread.", duration: "8 min", source: "youtube", href: "https://youtu.be/77ktNSPFbwQ?si=xOkt2LYtVYu8xFEy" },
  { id: "Ed1FmTSQS2Q", title: "Silk Cocoon Harvesting and Processing", channel: "YouTube", category: "Cocoon Production", description: "Harvesting cocoons and preparing them for processing.", duration: "7 min", source: "youtube", href: "https://youtu.be/Ed1FmTSQS2Q?si=5RR8GlmxH5xermg" },
  { id: "vlkIPELbKdo", title: "Introduction to Sericulture", channel: "Unyfa", category: "Beginner Guides", description: "A starter overview of sericulture for new learners.", duration: "10 min", source: "youtube", href: "https://www.youtube.com/watch?v=vlkIPELbKdo" },
  { id: "rDMD_tH8lFI", title: "Silk Farming Process - How Silk is Made", channel: "Unyfa", category: "Silk Processing", description: "Walks through the silk farming process end to end.", duration: "9 min", source: "youtube", href: "https://www.youtube.com/watch?v=rDMD_tH8lFI" },
  { id: "8XLSMj6Kt0U", title: "Mulberry Cultivation Guide for Sericulture", channel: "Kenaff Library", category: "Mulberry Cultivation", description: "Guidance on mulberry cultivation for healthy leaf supply.", duration: "11 min", source: "youtube", href: "https://youtu.be/8XLSMj6Kt0U" },
  { id: "FjjjxAlzLvE", title: "Silkworm Rearing Success Story (Farmer)", channel: "Kenaff Library", category: "Rearing Methods", description: "A farmer success story with practical rearing lessons.", duration: "6 min", source: "youtube", href: "https://www.youtube.com/watch?v=FjjjxAlzLvE" },
  { id: "eEgcHp1WBB4", title: "Production of Silk from Silkworm", channel: "YouTube", category: "Silk Processing", description: "Production steps from silkworm to raw silk.", duration: "8 min", source: "youtube", href: "https://www.youtube.com/watch?v=eEgcHp1WBB4" },
  { id: "eSBYHqhjpUs", title: "How to Turn Silkworm Farming into a Business", channel: "FO Library", category: "Market & Business", description: "Business ideas and market angle for sericulture.", duration: "12 min", source: "youtube", href: "https://www.youtube.com/watch?v=eSBYHqhjpUs" },
  { id: "fPMkLgLkALA", title: "Sericulture & Processing of Silk (Class 7)", channel: "YouTube", category: "Expert Tutorials", description: "Classroom-style explanation of sericulture basics.", duration: "10 min", source: "youtube", href: "https://www.youtube.com/watch?v=fPMkLgLkALA" },
  { id: "8aj39agrEEM", title: "Silkworm Rearing and Cocoon Production Training Video", channel: "YouTube", category: "Training Videos", description: "Training content for rearing and cocoon production.", duration: "13 min", source: "youtube", href: "https://youtu.be/8aj39agrEEM?si=vPQNhq4lG_swQxsy" },
  { id: "Y3SIlkEEamU", title: "Silkworm Rearing and Cocoon Production", channel: "YouTube", category: "Training Videos", description: "Another training-style silkworm rearing video.", duration: "12 min", source: "youtube", href: "https://youtu.be/Y3SIlkEEamU?si=R4XYZggv1smFmdUp" },
  { id: "Cdtbfz5AWZQ", title: "Silk Farming and Sericulture Basics", channel: "YouTube", category: "Beginner Guides", description: "Introductory guidance on silk farming basics.", duration: "9 min", source: "youtube", href: "https://youtu.be/Cdtbfz5AWZQ?si=mbVV2jZhpjE-z6X2" },
  { id: "learn-khan-1", title: "Life Cycle of Silkworm", channel: "Khan Academy", category: "Silkworm Seed Information", description: "Life-cycle learning resource from Khan Academy.", duration: "5 min", source: "khanacademy", href: "https://www.khanacademy.org/science/telangana-class-7-science/x71e9264c5e9276b1%3Asilk-wool/x71e9264c5e9276b1%3Asilk/v/sericulture-production-of-silk" },
  { id: "learn-khan-2", title: "Production of Silk from Silkworm", channel: "Khan Academy", category: "Silk Processing", description: "Sericulture and fiber-to-fabric learning resource.", duration: "6 min", source: "khanacademy", href: "https://www.khanacademy.org/science/revision-term-1-ka-science-class-7/x05832cca8e86a1ef:week-1/x05832cca8e86a1ef:fibre-to-fabric/v/sericulture-production-of-silk" },
  { id: "glasp-1", title: "Fibre to Fabric - Sericulture Process", channel: "Glasp", category: "Expert Tutorials", description: "A companion learning resource for sericulture concepts.", duration: "7 min", source: "web", href: "https://glasp.co/youtube/p/chemistry-fibre-to-fabric-part-7-sericulture-processing-of-silk-class-7-vii" },
];

const categories = ["All", ...new Set(videos.map((video) => video.category))];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Unable to read the image file."));
    reader.readAsDataURL(file);
  });
}

export default function LearningCenterPage() {
  const { lang, logActivity } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerResult, setScannerResult] = useState<ScannerResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const t = lang === "kn"
    ? {
        title: "ಕಲಿಕೆ ಕೇಂದ್ರ",
        subtitle: "ರೇಷ್ಮೆ ಶಿಕ್ಷಣಕ್ಕೆ ವೀಡಿಯೊಗಳು, ಚಿತ್ರಗಳು ಮತ್ತು ಮಾರ್ಗದರ್ಶಿಗಳು ಇಲ್ಲಿ ಇವೆ.",
        search: "ಹುಡುಕು",
        bookmark: "ಬುಕ್‌ಮಾರ್ಕ್",
        videos: "ವೀಡಿಯೊಗಳು",
        resources: "ಸಂಬಂಧಿತ ಸಂಪನ್ಮೂಲಗಳು",
        upload: "ಚಿತ್ರ ಅಪ್ಲೋಡ್ ಮಾಡಿ",
        analyze: "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
        analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
        scannerTitle: "AI ಸ್ಕ್ಯಾನರ್",
        scannerHint: "ಯಾವುದೇ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿದರೆ AI ವಿಶ್ಲೇಷಣೆ ತಕ್ಷಣ ತೋರಿಸಲಾಗುತ್ತದೆ.",
        detected: "ಗುರುತಿಸಲಾಗಿದೆ",
        healthStatus: "ಆರೋಗ್ಯ ಸ್ಥಿತಿ",
        analysis: "ವಿಶ್ಲೇಷಣೆ",
        recommendations: "ಶಿಫಾರಸುಗಳು",
        confidence: "ವಿಶ್ವಾಸ",
        raw: "ಮೂಲ ಪ್ರತಿಕ್ರಿಯೆ",
      }
    : {
        title: "Learning Center",
        subtitle: "Videos, images, and guides for sericulture education live here.",
        search: "Search",
        bookmark: "Bookmark",
        videos: "Videos",
        resources: "Related Resources",
        upload: "Upload Image",
        analyze: "Analyze Image",
        analyzing: "Analyzing...",
        scannerTitle: "AI Scanner",
        scannerHint: "Upload any image and the AI analysis will appear right away.",
        detected: "Detected",
        healthStatus: "Health Status",
        analysis: "Analysis",
        recommendations: "Recommendations",
        confidence: "Confidence",
        raw: "Raw response",
      };

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) =>
        video.title.toLowerCase().includes(query.toLowerCase()) &&
        (category === "All" || video.category === category),
      ),
    [category, query],
  );

  const youtubeVideos = filteredVideos.filter((video) => video.source === "youtube");
  const resourceLinks = filteredVideos.filter((video) => video.source !== "youtube");

  const handleUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError(lang === "kn" ? "ಸರಿ ಇರುವ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ." : "Please upload a valid image.");
      return;
    }

    setUploadError("");
    setScannerResult(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setScannerLoading(true);
    logActivity("image_upload", file.name);

    try {
      const imageBase64 = await fileToBase64(file);
      const response = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image analysis failed.");
      setScannerResult(data);
      logActivity("image_scan_success", data.detected || file.name);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unexpected scanner error.");
      logActivity("image_scan_failed", file.name);
    } finally {
      setScannerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-panel">
        <h1 className="section-title">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.subtitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="rounded-xl border border-emerald-200 px-4 py-3" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-emerald-200 px-4 py-3">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">{t.scannerTitle}</h2>
        <div className="section-panel">
          <p className="text-sm text-slate-600">{t.scannerHint}</p>
          <label className="mt-4 inline-flex cursor-pointer items-center rounded-full bg-[#2d6a4f] px-5 py-3 font-semibold text-white">
            {scannerLoading ? t.analyzing : t.upload}
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => handleUpload(event.target.files?.[0])}
            />
          </label>
          {uploadError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p>}
          {preview && (
            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-emerald-100">
              <Image src={preview} alt="Uploaded preview" fill className="object-cover" unoptimized />
            </div>
          )}
          {scannerResult && (
            <div className="mt-4 space-y-2 rounded-2xl bg-emerald-50 p-4 text-sm text-slate-700 ring-1 ring-emerald-100">
              <p><b>{t.detected}:</b> {scannerResult.detected}</p>
              <p><b>{t.healthStatus}:</b> {scannerResult.healthStatus}</p>
              <p><b>{t.analysis}:</b> {scannerResult.analysis}</p>
              <p><b>{t.recommendations}:</b> {scannerResult.recommendations}</p>
              <p><b>{t.confidence}:</b> {scannerResult.confidence}</p>
              <details className="rounded-xl bg-white p-3 ring-1 ring-emerald-100">
                <summary className="cursor-pointer font-medium text-[#2d6a4f]">{t.raw}</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">{scannerResult.raw}</pre>
              </details>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">{t.videos}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {youtubeVideos.map((video) => {
            const isBookmarked = bookmarks.includes(video.id);
            return (
              <article key={video.id} className="section-panel">
                <div className="aspect-video overflow-hidden rounded-2xl bg-emerald-100">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">{video.category}</p>
                <h3 className="mt-1 text-lg font-semibold text-[#214d39]">{video.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{video.channel} · {video.duration}</p>
                <p className="mt-2 text-sm text-slate-600">{video.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    className="chip"
                    onClick={() =>
                      setBookmarks((prev) =>
                        prev.includes(video.id) ? prev.filter((id) => id !== video.id) : [...prev, video.id],
                      )
                    }
                  >
                    {isBookmarked ? `${t.bookmark}ed` : t.bookmark}
                  </button>
                  <a className="chip" href={video.href} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">{t.resources}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {resourceLinks.map((video) => (
            <article key={video.id} className="section-panel">
              <h3 className="text-lg font-semibold text-[#214d39]">{video.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{video.channel} · {video.category}</p>
              <p className="mt-2 text-sm text-slate-600">{video.description}</p>
              <a className="mt-4 inline-flex chip" href={video.href} target="_blank" rel="noreferrer">Open resource</a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
