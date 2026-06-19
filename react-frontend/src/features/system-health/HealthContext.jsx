import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import useHealthSnapshot from "./useHealthSnapshot";
import { STATUS, isFeedStale } from "./healthUi";

// Holds the health snapshot once for the whole pilot UI so both the SYSTEM tab
// indicator and the panel read the same feed. Ticks once a second for live
// "updated Xs ago" / staleness without re-rendering the rest of the tree.
const HealthContext = createContext(null);

export function HealthProvider({ children }) {
  const { document, receivedAt } = useHealthSnapshot();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const value = useMemo(() => {
    const stale = isFeedStale(receivedAt, now);
    const overall = document ? (stale ? STATUS.UNKNOWN : document.overall) : null;
    return { document, receivedAt, now, stale, overall };
  }, [document, receivedAt, now]);

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealthContext() {
  return useContext(HealthContext);
}
