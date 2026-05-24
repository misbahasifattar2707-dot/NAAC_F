import { useMemo, useState } from "react";

/**
 * Client-side text filter over row objects (substring match on given keys).
 * Coerces non-array payloads to [] so list UIs don't crash on `.map` / `.filter`.
 */
export function useSearchFilter(rows, keys = []) {
  const [query, setQuery] = useState("");
  const list = Array.isArray(rows) ? rows : [];
  const filteredRows = useMemo(() => {
    const s = (query || "").trim().toLowerCase();
    if (!s) return list;
    return list.filter((row) =>
      keys.some((k) => String(row[k] ?? "").toLowerCase().includes(s))
    );
  }, [list, keys, query]);
  return { query, setQuery, filteredRows };
}
