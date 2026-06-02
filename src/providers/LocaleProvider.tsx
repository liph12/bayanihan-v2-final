"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/types";

type MessageKey =
  | "language"
  | "popularCountries"
  | "discoverEventsTitle"
  | "discoverRestaurantsTitle"
  | "topDestinationsTitle"
  | "aboutTitle"
  | "aboutP1"
  | "aboutP2";

const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    language: "Language",
    popularCountries: "Popular Countries",
    discoverEventsTitle: "Discover Events",
    discoverRestaurantsTitle: "Discover Filipino Restaurants",
    topDestinationsTitle: "Top destinations in Philippines",
    aboutTitle: "About Bayanihan.com",
    aboutP1:
      "Bayanihan.com connects Filipinos around the world through events, culture, and cuisine. We help communities discover Filipino celebrations and support Filipino restaurants abroad, keeping our traditions and connections alive wherever Filipinos may be.",
    aboutP2:
      "Celebrating Filipino culture worldwide through events, food, and community.",
  },
  fil: {
    language: "Wika",
    popularCountries: "Mga Sikat na Bansa",
    discoverEventsTitle: "Tuklasin ang mga Event",
    discoverRestaurantsTitle: "Tuklasin ang mga Restawrang Pilipino",
    topDestinationsTitle: "Top destinations sa Pilipinas",
    aboutTitle: "Tungkol sa Bayanihan.com",
    aboutP1:
      "Ikinokonekta ng Bayanihan.com ang mga Pilipino sa buong mundo sa pamamagitan ng events, kultura, at pagkain. Tinutulungan namin ang mga komunidad na matuklasan ang mga pagdiriwang at masuportahan ang mga restawrang Pilipino sa ibayong-dagat, pinananatiling buhay ang ating tradisyon at ugnayan saanman naroroon ang mga Pilipino.",
    aboutP2:
      "Ipinagdiriwang ang kulturang Pilipino sa buong mundo sa pamamagitan ng events, pagkain, at komunidad.",
  },
};

export interface LocaleContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fil";
}

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("lang");
    if (isLocale(stored)) setLang(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
  }, [lang]);

  const t = useCallback(
    (key: string): string => {
      const k = key as MessageKey;
      return messages[lang]?.[k] ?? messages.en[k] ?? key;
    },
    [lang]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ lang, setLang, t }),
    [lang, t]
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
