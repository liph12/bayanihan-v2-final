"use client";
import {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
  cloneElement,
  type ReactElement,
} from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import {
  StorefrontOutlined as StorefrontIcon,
  MenuBookOutlined as MenuBookIcon,
  LocationOnOutlined as LocationOnIcon,
  ArrowForwardIos as ArrowRightIcon,
  ArrowBackIos as ArrowLeftIcon,
  Add as AddIcon,
  KeyboardArrowRight as ChevronIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ReactCountryFlag from "react-country-flag";
import AxiosInstance from "@/lib/AxiosInstance";
import { useAuthProvider } from "@/providers/AuthProvider";
import { countryCodes } from "@/lib/countryCodes";

interface RestaurantData {
  id?: string | number;
  uuid?: string;
  slug?: string;
  restaurant_id?: string | number;
  user_id?: string | number;
  userId?: string | number;
  owner_id?: string | number;
  user?: { id?: string | number };
  name?: string;
  country?: string;
  city?: string;
  category?: string;
  cover?: string;
  logo?: string;
  menus?: Array<{ avatar?: string }>;
}

const C = {
  sky: "#0ea5e9",
  skyDeep: "#082f49",
  skyG: "rgba(14,165,233,0.18)",
  mint: "#29ac7c",
  mintB: "rgba(52,211,153,0.5)",
  mintG: "rgba(52,211,153,0.18)",
  white: "#fff",
  wg: "rgba(255,255,255,0.13)",
  wb: "rgba(255,255,255,0.24)",
};

const PC = [
  "#0ea5e9",
  "#34d399",
  "#f59e0b",
  "#f43f5e",
  "#a855f7",
  "#fb923c",
  "#22d3ee",
  "#818cf8",
  "#4ade80",
  "#e879f9",
];

function nameToCode(name?: string): string | null {
  if (!name) return null;
  const e = countryCodes.find(
    (c) => c.name.toLowerCase() === String(name).toLowerCase()
  );
  return e ? e.code : null;
}

interface SemiDonutData {
  label: string;
  value: number;
  code: string | null;
}

function SemiDonut({
  data,
  size = 300,
}: {
  data: SemiDonutData[];
  size?: number;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const strokeW = 30;
  const padding = 40;
  const W = size + padding * 2;
  const r = size / 2 - strokeW / 2 - 2;
  const cx = W / 2;
  const cy = size / 2;

  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return null;

  const gap = 0.03;
  type Slice = SemiDonutData & {
    color: string;
    path: string;
    pct: number;
    mid: number;
    lx: number;
    ly: number;
  };
  const slices: Slice[] = [];
  let cur = Math.PI;

  data.forEach((d, i) => {
    const span = (d.value / total) * Math.PI;
    const start = cur + gap / 2;
    const end = cur + span - gap / 2;
    const mid = (start + end) / 2;

    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const lg = span - gap > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2}`;

    const labelR = r + strokeW / 2 + 22;
    const lx = cx + labelR * Math.cos(mid);
    const ly = cy + labelR * Math.sin(mid);

    slices.push({
      ...d,
      color: PC[i % PC.length],
      path,
      pct: Math.round((d.value / total) * 100),
      mid,
      lx,
      ly,
    });
    cur += span;
  });

  const svgH = cy + strokeW / 2 + 36;
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${svgH}`}
      style={{ width: "100%", display: "block", overflow: "visible" }}
    >
      <path
        d={trackPath}
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      {slices.map((sl, i) => (
        <path
          key={i}
          d={sl.path}
          fill="none"
          stroke={sl.color}
          strokeWidth={hov === i ? strokeW + 6 : strokeW}
          strokeLinecap="round"
          opacity={hov !== null && hov !== i ? 0.35 : 1}
          style={{
            transition: "stroke-width 0.2s ease, opacity 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(null)}
        />
      ))}
      {slices.map((sl, i) => {
        if (sl.pct < 5) return null;
        const anchor =
          sl.lx < cx - 10 ? "end" : sl.lx > cx + 10 ? "start" : "middle";
        return (
          <text
            key={`lbl-${i}`}
            x={sl.lx}
            y={sl.ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="#fff"
            fontSize="18"
            fontWeight="700"
            fontFamily="Outfit,sans-serif"
            style={{ pointerEvents: "none" }}
          >
            {sl.pct}%
          </text>
        );
      })}
      <text
        x={cx}
        y={cy - 40}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize="45"
        fontWeight="900"
        fontFamily="Outfit,sans-serif"
        style={{ pointerEvents: "none" }}
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize="20"
        fontWeight="600"
        fontFamily="Outfit,sans-serif"
        style={{ pointerEvents: "none" }}
      >
        total restaurants
      </text>
    </svg>
  );
}

function RestaurantCard({
  r,
  index,
  onClick,
}: {
  r: RestaurantData;
  index: number;
  onClick: () => void;
}) {
  const code = nameToCode(r.country);
  const menus = r.menus?.length ?? 0;
  const img =
    r.cover ||
    r.logo ||
    (r.menus && r.menus.find((m) => m?.avatar)?.avatar) ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop";

  return (
    <Box
      onClick={onClick}
      sx={{
        width: {
          xs: "calc(85vw - 32px)",
          sm: "calc(50% - 24px)",
          md: "calc(25% - 18px)",
        },
        maxWidth: { xs: 340, sm: 9999, md: 9999 },
        minWidth: { sm: 200, md: 180 },
        borderRadius: "20px",
        overflow: "hidden",
        background: "rgba(8,47,73,0.6)",
        backdropFilter: "blur(16px)",
        border: `1.5px solid ${C.wb}`,
        animationDelay: `${index * 65}ms`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        scrollSnapAlign: "start",
        cursor: "pointer",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
        "&:hover": {
          transform: "translateY(-7px)",
          boxShadow: "0 22px 44px rgba(3,105,161,0.38)",
        },
      }}
    >
      <Box sx={{ position: "relative", height: 200, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={r.name || "restaurant"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.48s ease",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg,rgba(0,0,0,0.02) 0%,rgba(0,0,0,0.85) 100%)",
          }}
        />
        {code && (
          <Box
            sx={{
              position: "absolute",
              top: 11,
              right: 11,
              width: 30,
              height: 30,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.9)",
            }}
          >
            <ReactCountryFlag
              countryCode={code}
              svg
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        )}
        {r.category && (
          <Box
            sx={{
              position: "absolute",
              top: 11,
              left: 11,
              bgcolor: "rgba(255,255,255,0.92)",
              borderRadius: "8px",
              px: 1.2,
              py: 0.4,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Outfit,sans-serif",
                fontWeight: 700,
                fontSize: "0.78rem",
                color: C.skyDeep,
                lineHeight: 1.4,
              }}
            >
              {r.category}
            </Typography>
          </Box>
        )}
        <Box sx={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
          <Typography
            sx={{
              fontFamily: "Outfit,sans-serif",
              fontWeight: 800,
              fontSize: "1.15rem",
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.25,
            }}
          >
            {r.name || "Unnamed"}
          </Typography>
          {(r.city || r.country) && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.3 }}
            >
              <LocationOnIcon sx={{ fontSize: 13, color: C.mint }} />
              <Typography
                sx={{
                  fontFamily: "Outfit,sans-serif",
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {[r.city, r.country].filter(Boolean).join(", ")}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          p: 2.2,
          display: "flex",
          flexDirection: "column",
          gap: 1.4,
          background: C.skyDeep,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              background: "rgba(14,165,233,0.14)",
              border: "1px solid rgba(14,165,233,0.4)",
              borderRadius: "12px",
              py: 1.1,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Outfit,sans-serif",
                fontWeight: 900,
                fontSize: "1.3rem",
                color: C.sky,
                lineHeight: 1,
              }}
            >
              {menus}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Outfit,sans-serif",
                fontSize: "1.2rem",
                color: "rgba(255,255,255,0.72)",
                fontWeight: 600,
                mt: 0.25,
              }}
            >
              Menus
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.7,
            background: C.mint,
            borderRadius: "12px",
            py: 1.1,
            transition: "background 0.22s ease",
            "&:hover": { background: "#059669" },
          }}
        >
          <Typography
            sx={{
              fontFamily: "Outfit,sans-serif",
              fontWeight: 800,
              fontSize: "0.95rem",
              color: C.white,
            }}
          >
            Manage Restaurant
          </Typography>
          <ArrowRightIcon sx={{ fontSize: 14, color: C.white }} />
        </Box>
      </Box>
    </Box>
  );
}

interface StatCard {
  icon: ReactElement<{ sx?: object }>;
  val: number;
  lbl: string;
  mint: boolean;
}

export default function RestaurantStats() {
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const { userData, authenticated } = useAuthProvider();
  const userId = (userData as { id?: string | number } | null)?.id;

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!authenticated) return;
      setLoading(true);
      try {
        let resp: unknown;
        try {
          const r = await AxiosInstance.get("profile/restaurants");
          resp = r.data;
        } catch {
          const r = await AxiosInstance.get("profile/restaurants/");
          resp = r.data;
        }

        let arr: RestaurantData[] = [];
        const r = resp as {
          data?: {
            restaurant?: RestaurantData | RestaurantData[];
          } | RestaurantData[];
          restaurant?: RestaurantData[];
        };
        if (Array.isArray(resp)) arr = resp as RestaurantData[];
        else if (Array.isArray(r?.data) && r.data && (r.data as RestaurantData[]).length !== undefined)
          arr = r.data as RestaurantData[];
        else if (
          r?.data &&
          typeof r.data === "object" &&
          "restaurant" in r.data &&
          Array.isArray((r.data as { restaurant?: RestaurantData[] }).restaurant)
        )
          arr = (r.data as { restaurant: RestaurantData[] }).restaurant;
        else if (Array.isArray(r?.restaurant)) arr = r.restaurant;

        const uid = String(userId ?? "");
        const owned = arr.filter((rest) => {
          const cs = [
            rest?.user_id,
            rest?.userId,
            rest?.owner_id,
            rest?.user?.id,
          ].filter((v): v is string | number => v != null);
          return cs.length === 0 ? true : cs.some((v) => String(v) === uid);
        });
        if (mounted) setRestaurants(owned);
      } catch (e) {
        console.warn("RestaurantStats:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [authenticated, userId]);

  const getCardWidth = useCallback(() => {
    if (!sliderRef.current) return 296;
    const firstCard = sliderRef.current.firstChild as HTMLElement | null;
    return firstCard ? firstCard.offsetWidth + 16 : 296;
  }, []);

  const scrollTo = useCallback(
    (idx: number) => {
      if (!sliderRef.current || !restaurants.length) return;
      const clamped = Math.max(0, Math.min(idx, restaurants.length - 1));
      sliderRef.current.scrollTo({
        left: clamped * getCardWidth(),
        behavior: "smooth",
      });
      setActiveIndex(clamped);
    },
    [restaurants.length, getCardWidth]
  );

  const scroll = useCallback(
    (dir: number) => {
      const next = activeIndex + dir;
      if (next < 0) scrollTo(restaurants.length - 1);
      else if (next >= restaurants.length) scrollTo(0);
      else scrollTo(next);
    },
    [activeIndex, restaurants.length, scrollTo]
  );

  useEffect(() => {
    if (loading || restaurants.length <= 1 || isPaused) return;
    autoSlideRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % restaurants.length;
        if (sliderRef.current) {
          sliderRef.current.scrollTo({
            left: next * getCardWidth(),
            behavior: "smooth",
          });
        }
        return next;
      });
    }, 3500);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [loading, restaurants.length, isPaused, getCardWidth]);

  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const idx = Math.round(sliderRef.current.scrollLeft / getCardWidth());
    setActiveIndex(idx);
  }, [getCardWidth]);

  const stats = useMemo(
    () => ({
      totalRestaurants: restaurants.length,
      totalMenus: restaurants.reduce((a, r) => a + (r.menus?.length ?? 0), 0),
      uniqueCountries: new Set(
        restaurants.map((r) => r.country).filter(Boolean)
      ).size,
    }),
    [restaurants]
  );

  const countryData = useMemo<SemiDonutData[]>(() => {
    const freq: Record<string, number> = {};
    restaurants.forEach((r) => {
      if (r.country) freq[r.country] = (freq[r.country] || 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value, code: nameToCode(label) }));
  }, [restaurants]);

  const total = countryData.reduce((a, d) => a + d.value, 0);

  const STATS: StatCard[] = [
    {
      icon: <StorefrontIcon />,
      val: stats.totalRestaurants,
      lbl: "My Restaurants",
      mint: false,
    },
    {
      icon: <MenuBookIcon />,
      val: stats.totalMenus,
      lbl: "Total Menus",
      mint: true,
    },
    {
      icon: <LocationOnIcon />,
      val: stats.uniqueCountries,
      lbl: "Countries",
      mint: false,
    },
  ];

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg,${C.skyDeep} 0%,#0c4a6e 45%,${C.sky} 100%)`,
        borderRadius: "22px",
        p: { xs: 2, sm: 2.5, md: 3 },
        fontFamily: "Outfit,sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(14,165,233,0.09)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -70,
          left: -40,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(52,211,153,0.07)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.8,
          mb: 2.5,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header card */}
        <Box
          sx={{
            background: C.wg,
            backdropFilter: "blur(14px)",
            borderRadius: "18px",
            border: `1px solid ${C.wb}`,
            p: { xs: 2, sm: 2.5 },
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            gap: { xs: 1.5, sm: 3 },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "Outfit,sans-serif",
                fontWeight: 900,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                color: C.white,
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              Manage Your Restaurants
            </Typography>
            <Typography
              sx={{
                fontFamily: "Outfit,sans-serif",
                fontSize: { xs: "0.88rem", sm: "0.95rem" },
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
              }}
            >
              Track your restaurants, menus, and dishes all in one place.
            </Typography>
          </Box>
          <Box
            onClick={() => router.push("/profile/create-restaurant")}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              flexShrink: 0,
              background: C.mint,
              color: C.white,
              fontFamily: "Outfit,sans-serif",
              fontWeight: 800,
              fontSize: "0.95rem",
              px: 2.4,
              py: 1.1,
              borderRadius: "12px",
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "center", sm: "flex-start" },
              cursor: "pointer",
              transition: "background 0.22s ease, transform 0.22s ease",
              "&:hover": { background: "#059669", transform: "translateY(-2px)" },
            }}
          >
            <AddIcon sx={{ fontSize: 19 }} />
            Add Restaurant
          </Box>
        </Box>

        {/* Stat cards grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(3, 1fr)",
              md: "1fr 1fr 1fr 2fr",
            },
            gap: { xs: 1.2, md: 1.8 },
            alignItems: "stretch",
          }}
        >
          {STATS.map((s, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1.2,
                background: C.wg,
                backdropFilter: "blur(14px)",
                borderRadius: "18px",
                border: `1px solid ${C.wb}`,
                p: { xs: 1.8, sm: 2.4 },
                gridColumn: { xs: i === 2 ? "1 / -1" : "auto", sm: "auto" },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background: s.mint ? C.mintG : C.skyG,
                  border: `1.5px solid ${
                    s.mint ? C.mintB : "rgba(14,165,233,0.4)"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cloneElement(s.icon, {
                  sx: { color: s.mint ? C.mint : C.sky, fontSize: 24 },
                })}
              </Box>
              {loading ? (
                <>
                  <Skeleton
                    width={60}
                    height={42}
                    sx={{ borderRadius: 1, bgcolor: "rgba(255,255,255,0.16)" }}
                  />
                  <Skeleton
                    width={90}
                    height={18}
                    sx={{ borderRadius: 1, bgcolor: "rgba(255,255,255,0.09)" }}
                  />
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: "Outfit,sans-serif",
                      fontWeight: 900,
                      fontSize: { xs: "2rem", sm: "2.4rem" },
                      color: C.white,
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Outfit,sans-serif",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {s.lbl}
                  </Typography>
                </>
              )}
            </Box>
          ))}

          {/* Country distribution card */}
          <Box
            sx={{
              background: C.wg,
              backdropFilter: "blur(14px)",
              borderRadius: "18px",
              border: `1px solid ${C.wb}`,
              p: { xs: 1.8, sm: 2.4 },
              display: "flex",
              flexDirection: "column",
              gap: 1.4,
              gridColumn: { xs: "1 / -1", sm: "1 / -1", md: "auto" },
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "Outfit,sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.04em",
                  mb: 0.4,
                }}
              >
                COUNTRY DISTRIBUTION
              </Typography>
              {!loading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Typography
                    sx={{
                      fontFamily: "Outfit,sans-serif",
                      fontWeight: 900,
                      fontSize: "2.8rem",
                      color: C.white,
                      lineHeight: 1,
                    }}
                  >
                    {total}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.4,
                      background: "rgba(52,211,153,0.18)",
                      border: "1px solid rgba(52,211,153,0.4)",
                      borderRadius: "8px",
                      px: 1,
                      py: 0.4,
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 14, color: C.mint }} />
                    <Typography
                      sx={{
                        fontFamily: "Outfit,sans-serif",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: C.mint,
                      }}
                    >
                      {stats.uniqueCountries} countries
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {!loading && countryData.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.6,
                    minWidth: 0,
                    flex: 1,
                    width: "100%",
                  }}
                >
                  {countryData.slice(0, 4).map((d, i) => {
                    const pct =
                      total > 0
                        ? ((d.value / total) * 100).toFixed(1)
                        : "0";
                    return (
                      <Box
                        key={d.label}
                        sx={{
                          background: "rgba(0,0,0,0.5)",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 0.55,
                          px: 0.8,
                          borderRadius: "10px",
                        }}
                      >
                        {d.code ? (
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              overflow: "hidden",
                              flexShrink: 0,
                              border: "1.5px solid rgba(255,255,255,0.3)",
                            }}
                          >
                            <ReactCountryFlag
                              countryCode={d.code}
                              svg
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              bgcolor: "rgba(255,255,255,0.1)",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <LocationOnIcon
                              sx={{
                                fontSize: 14,
                                color: "rgba(255,255,255,0.4)",
                              }}
                            />
                          </Box>
                        )}
                        <Typography
                          noWrap
                          sx={{
                            fontFamily: "Outfit,sans-serif",
                            fontWeight: 700,
                            fontSize: "0.92rem",
                            color: "rgba(255,255,255,0.9)",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {d.code || d.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Outfit,sans-serif",
                            fontWeight: 800,
                            fontSize: "0.92rem",
                            color: PC[i % PC.length],
                            flexShrink: 0,
                          }}
                        >
                          {pct}%
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: { xs: "100%", sm: 200, md: 260 },
                    maxWidth: { xs: 260, sm: 200, md: 260 },
                    mx: { xs: "auto", sm: 0 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <SemiDonut data={countryData} size={260} />
                </Box>
              </Box>
            )}

            {!loading && countryData.length === 0 && (
              <Typography
                sx={{
                  fontFamily: "Outfit,sans-serif",
                  fontSize: "0.95rem",
                  color: "rgba(255,255,255,0.35)",
                  py: 2,
                }}
              >
                No country data yet.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Restaurant carousel */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.6,
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Outfit,sans-serif",
              fontWeight: 800,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              color: C.white,
            }}
          >
            Your Restaurants
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              onClick={() => router.push("/profile/my-restaurants")}
              sx={{
                fontFamily: "Outfit,sans-serif",
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                fontWeight: 700,
                color: "#8ff8d1",
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                cursor: "pointer",
              }}
            >
              See all <ChevronIcon sx={{ fontSize: 17 }} />
            </Box>
            {!loading && restaurants.length > 1 && (
              <Box sx={{ display: "flex", gap: 0.7 }}>
                {[
                  { dir: -1, icon: <ArrowLeftIcon sx={{ fontSize: 13 }} /> },
                  { dir: 1, icon: <ArrowRightIcon sx={{ fontSize: 13 }} /> },
                ].map(({ dir, icon }) => (
                  <Box
                    key={dir}
                    onClick={() => scroll(dir)}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      background: C.sky,
                      border: `1px solid ${C.wb}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      "& svg": { color: C.white },
                    }}
                  >
                    {icon}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", gap: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                sx={{
                  width: {
                    xs: "calc(85vw - 32px)",
                    sm: "calc(50% - 24px)",
                    md: "calc(25% - 18px)",
                  },
                  height: 310,
                  borderRadius: "20px",
                  flexShrink: 0,
                  bgcolor: "rgba(255,255,255,0.07)",
                }}
              />
            ))}
          </Box>
        )}

        {!loading && restaurants.length === 0 && (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              background: C.wg,
              backdropFilter: "blur(12px)",
              border: `2px dashed ${C.wb}`,
              borderRadius: "18px",
            }}
          >
            <StorefrontIcon
              sx={{ fontSize: 48, color: "#8ff8d1", opacity: 0.4, mb: 1.2 }}
            />
            <Typography
              sx={{
                fontFamily: "Outfit,sans-serif",
                fontWeight: 800,
                fontSize: "1.2rem",
                color: C.white,
                mb: 0.6,
              }}
            >
              No restaurants yet
            </Typography>
            <Typography
              sx={{
                fontFamily: "Outfit,sans-serif",
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.5)",
                mb: 2.2,
              }}
            >
              Add your first restaurant to get started.
            </Typography>
            <Box
              onClick={() => router.push("/profile/create-restaurant")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.7,
                background: C.mint,
                color: C.white,
                fontFamily: "Outfit,sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                px: 2.5,
                py: 1.1,
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              Add Restaurant
            </Box>
          </Box>
        )}

        {!loading && restaurants.length > 0 && (
          <>
            <Box
              ref={sliderRef}
              onScroll={handleScroll}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              sx={{
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              {restaurants.map((r, i) => {
                const id =
                  r?.id ?? r?.uuid ?? r?.slug ?? r?.restaurant_id;
                return (
                  <RestaurantCard
                    key={String(id)}
                    r={r}
                    index={i}
                    onClick={() =>
                      router.push(`/profile/my-restaurants/${id}/edit`)
                    }
                  />
                );
              })}
            </Box>

            {restaurants.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 0.8,
                  mt: 1.8,
                }}
              >
                {restaurants.map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => scrollTo(i)}
                    sx={{
                      width: i === activeIndex ? 22 : 8,
                      height: 8,
                      borderRadius: i === activeIndex ? "4px" : "50%",
                      background:
                        i === activeIndex ? "#0ea5e9" : "rgba(255,255,255,0.28)",
                      transition: "all 0.25s ease",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
