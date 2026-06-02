"use client";
import * as React from "react";
import type { ReactNode } from "react";
import createCache from "@emotion/cache";
import type { EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

interface CacheHandle {
  cache: EmotionCache;
  flush: () => string[];
}

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = React.useState<CacheHandle>(() => {
    const cache = createCache({ key: "mui", prepend: true });
    cache.compat = true;
    const prevInsert = cache.insert.bind(cache);
    let inserted: string[] = [];
    cache.insert = ((...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    }) as typeof cache.insert;
    const flush = (): string[] => {
      const prev = inserted;
      inserted = [];
      return prev;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
