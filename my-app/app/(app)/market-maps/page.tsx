"use client";

import { useMemo, useState } from "react";
import { useApp } from "../../providers";

type MarketType = "silkworm" | "cocoon" | "silk" | "government";
type Market = {
  id: string;
  name: string;
  type: MarketType;
  address: string;
  contact: string;
  distanceKm: number;
  hours: string;
  district: string;
  city: string;
  village: string;
  lat: number;
  lng: number;
};

const markets: Market[] = [
  { id: "ramanagara", name: "Ramanagara Silk Market", type: "silk", address: "Ramanagara, Karnataka", contact: "+91 080 1234 1001", distanceKm: 4.2, hours: "09:00 - 17:30", district: "Ramanagara", city: "Ramanagara", village: "Bidadi", lat: 57, lng: 68 },
  { id: "kolar", name: "Kolar Cocoon Market", type: "cocoon", address: "Kolar, Karnataka", contact: "+91 080 1234 1002", distanceKm: 16.8, hours: "08:30 - 16:30", district: "Kolar", city: "Kolar", village: "Mulbagal", lat: 44, lng: 56 },
  { id: "mysuru", name: "Mysuru Silkworm Market", type: "silkworm", address: "Mysuru, Karnataka", contact: "+91 080 1234 1003", distanceKm: 23.4, hours: "10:00 - 18:00", district: "Mysuru", city: "Mysuru", village: "Nanjangud", lat: 34, lng: 34 },
  { id: "haveri", name: "Haveri Sericulture Office", type: "government", address: "Haveri, Karnataka", contact: "+91 080 1234 1004", distanceKm: 31.1, hours: "10:00 - 17:00", district: "Haveri", city: "Haveri", village: "Byadgi", lat: 48, lng: 24 },
  { id: "mandya", name: "Mandya Silk Market", type: "silk", address: "Mandya, Karnataka", contact: "+91 080 1234 1005", distanceKm: 7.9, hours: "09:30 - 18:00", district: "Mandya", city: "Mandya", village: "Srirangapatna", lat: 63, lng: 45 },
  { id: "dharwad", name: "Dharwad Cocoon Market", type: "cocoon", address: "Dharwad, Karnataka", contact: "+91 080 1234 1006", distanceKm: 28.6, hours: "08:00 - 16:00", district: "Dharwad", city: "Dharwad", village: "Hubballi", lat: 29, lng: 18 },
];

const typeColors: Record<MarketType, string> = {
  silkworm: "#7c3aed",
  cocoon: "#f59e0b",
  silk: "#2d6a4f",
  government: "#2563eb",
};

export default function MarketMapsPage() {
  const { lang, logActivity } = useApp();
  const [selectedType, setSelectedType] = useState<MarketType | "all">("all");
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All");
  const [userPosition, setUserPosition] = useState({ lat: 50, lng: 50 });
  const [selectedMarket, setSelectedMarket] = useState<Market>(markets[0]);

  const t = lang === "kn"
    ? {
        title: "ಮಾರುಕಟ್ಟೆ ನಕ್ಷೆಗಳು",
        subtitle: "ಹತ್ತಿರದ ರೇಷ್ಮೆ, ಕೋಕೂನ್, ಮಲ್ಬೆರಿ ಮತ್ತು ಸರ್ಕಾರಿ ಕೇಂದ್ರಗಳನ್ನು ನೋಡಿ.",
        search: "ಹುಡುಕು",
        location: "ನನ್ನ ಸ್ಥಳ ಕಂಡುಹಿಡಿ",
        nearby: "ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು",
        popular: "ಜನಪ್ರಿಯ ಮಾರುಕಟ್ಟೆಗಳು",
        government: "ಸರ್ಕಾರಿ ಕೇಂದ್ರಗಳು",
        route: "ಮಾರ್ಗ ಸಂಚಲನ",
        name: "ಹೆಸರು",
        address: "ವಿಳಾಸ",
        contact: "ಸಂಪರ್ಕ",
        distance: "ದೂರ",
        hours: "ಕಾರ್ಯಾವಳಿ ಸಮಯ",
        districts: "ಜಿಲ್ಲೆ ಫಿಲ್ಟರ್",
        all: "ಎಲ್ಲಾ",
        types: {
          silkworm: "ರೇಷ್ಮೆ ಹುಳು ಮಾರುಕಟ್ಟೆ",
          cocoon: "ಕೋಕೂನ್ ಮಾರುಕಟ್ಟೆ",
          silk: "ರೇಷ್ಮೆ ಮಾರುಕಟ್ಟೆ",
          government: "ಸರಕಾರಿ ಕಚೇರಿ",
        },
      }
    : {
        title: "Market Maps",
        subtitle: "View nearby silk, cocoon, mulberry, and government centers.",
        search: "Search",
        location: "Find My Location",
        nearby: "Nearby Markets",
        popular: "Popular Markets",
        government: "Government Centers",
        route: "Route Navigation",
        name: "Name",
        address: "Address",
        contact: "Contact",
        distance: "Distance",
        hours: "Opening Hours",
        districts: "District Filter",
        all: "All",
        types: {
          silkworm: "Silkworm Market",
          cocoon: "Cocoon Market",
          silk: "Silk Market",
          government: "Government Office",
        },
      };

  const districts = ["All", ...Array.from(new Set(markets.map((market) => market.district)))];
  const filteredMarkets = useMemo(
    () =>
      markets.filter((market) =>
        market.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedType === "all" || market.type === selectedType) &&
        (district === "All" || market.district === district),
      ),
    [district, search, selectedType],
  );

  const highlighted = filteredMarkets[0] || selectedMarket;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(highlighted.name)}`;

  const locateUser = () => {
    logActivity("request_location", "market_maps");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => setUserPosition({ lat: 50, lng: 50 }),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="section-panel">
        <h1 className="section-title">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.subtitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.search}
            className="rounded-xl border border-emerald-200 px-4 py-3"
          />
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as MarketType | "all")}
            className="rounded-xl border border-emerald-200 px-4 py-3"
          >
            <option value="all">{t.all}</option>
            <option value="silkworm">{t.types.silkworm}</option>
            <option value="cocoon">{t.types.cocoon}</option>
            <option value="silk">{t.types.silk}</option>
            <option value="government">{t.types.government}</option>
          </select>
          <select
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            className="rounded-xl border border-emerald-200 px-4 py-3"
          >
            {districts.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="chip" onClick={locateUser}>{t.location}</button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="section-panel">
          <div className="mb-4 flex flex-wrap gap-2">
            {[t.nearby, t.popular, t.government, t.route].map((label) => (
              <span key={label} className="chip">{label}</span>
            ))}
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
            <button
              type="button"
              onClick={() => window.open(googleMapsUrl, "_blank", "noopener,noreferrer")}
              className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-emerald-100 bg-[#f7fff9] text-left"
              title={lang === "kn" ? "Google Maps ನಲ್ಲಿ ತೆರೆಯಿರಿ" : "Open in Google Maps"}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#d1fae5" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                <path d="M 8 74 C 22 66, 26 53, 35 48 S 56 41, 63 31 S 80 18, 92 20" fill="none" stroke="#2d6a4f" strokeWidth="1.6" strokeDasharray="2 1.3" />
                <circle cx={userPosition.lng} cy={userPosition.lat} r="3" fill="#ef4444" />
                <text x={userPosition.lng + 4} y={userPosition.lat + 1} fontSize="4" fill="#991b1b">
                  You
                </text>
                {filteredMarkets.map((market) => (
                  <g
                    key={market.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedMarket(market);
                      logActivity("map_marker_select", market.name);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx={market.lng} cy={market.lat} r="3.4" fill={typeColors[market.type]} />
                    <circle cx={market.lng} cy={market.lat} r="5.2" fill="none" stroke={typeColors[market.type]} strokeWidth="0.7" opacity="0.35" />
                    <text x={market.lng + 4} y={market.lat + 1} fontSize="4" fill="#1f2937">
                      {market.name.split(" ")[0]}
                    </text>
                  </g>
                ))}
              </svg>
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2d6a4f] shadow">
                {lang === "kn" ? "ನಕ್ಷೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ Google Maps ತೆರೆಯಿರಿ" : "Click map to open Google Maps"}
              </span>
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <article className="section-panel">
            <h2 className="text-lg font-semibold text-[#214d39]">{highlighted.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{highlighted.address}</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-700">
              <p><span className="font-semibold">{t.name}:</span> {highlighted.name}</p>
              <p><span className="font-semibold">{t.address}:</span> {highlighted.address}</p>
              <p><span className="font-semibold">{t.contact}:</span> {highlighted.contact}</p>
              <p><span className="font-semibold">{t.distance}:</span> {highlighted.distanceKm.toFixed(1)} km</p>
              <p><span className="font-semibold">{t.hours}:</span> {highlighted.hours}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                className="chip"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(highlighted.name)}`}
              >
                Google Maps
              </a>
              <a
                className="chip"
                target="_blank"
                rel="noreferrer"
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(highlighted.name)}`}
              >
                OpenStreetMap
              </a>
            </div>
          </article>

          {filteredMarkets.map((market) => (
            <article key={market.id} className="section-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t.types[market.type]}</p>
                  <h3 className="text-lg font-semibold text-[#214d39]">{market.name}</h3>
                </div>
              <button className="chip" onClick={() => setSelectedMarket(market)}>
                View
              </button>
              <a
                className="chip"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(market.name)}`}
              >
                Map
              </a>
            </div>
              <p className="mt-2 text-sm text-slate-600">{market.address}</p>
            </article>
          ))}
        </aside>
      </section>
    </div>
  );
}
