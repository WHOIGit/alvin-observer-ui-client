// System health data hook. Subscribes to the alvin-vitals HealthSnapshot event
// via the shared useSocket pool (REST GET /health as fallback) and stores the
// latest document plus its arrival time so the view can detect a stale feed.
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketListener } from "../../hooks/useSocket";
import {
  HEALTH_SNAPSHOT_EVENT,
  MOCK_HEALTH,
  VITALS_HEALTH_NAMESPACE,
  VITALS_REST_URL,
  VITALS_WS_APIVERSION,
  WS_ENDPOINTS,
} from "../../config";
import HEALTH_FIXTURE from "./healthFixture";

// Subscribe to the live feed only when not mocking and the vitals socket
// endpoint is actually configured; otherwise the hook stays on fixture / REST.
const LIVE_FEED_ENABLED =
  !MOCK_HEALTH && Boolean(WS_ENDPOINTS && WS_ENDPOINTS[VITALS_WS_APIVERSION]);

// How often the REST fallback polls, and how recent a socket push must be to
// suppress that poll (socket is preferred, REST only fills gaps).
const REST_POLL_MS = 10000;
const SOCKET_FRESH_MS = 8000;
// Mock keepalive cadence — re-stamps the fixture so the preview stays "live".
const MOCK_KEEPALIVE_MS = 5000;

export default function useHealthSnapshot() {
  const [document, setDocument] = useState(MOCK_HEALTH ? HEALTH_FIXTURE : null);
  const [receivedAt, setReceivedAt] = useState(MOCK_HEALTH ? Date.now() : null);
  const lastSocketAtRef = useRef(0);

  const store = useCallback((doc, viaSocket) => {
    if (!doc) return;
    if (viaSocket) lastSocketAtRef.current = Date.now();
    setDocument(doc);
    setReceivedAt(Date.now());
  }, []);

  // --- Socket push (preferred) ---
  const onSnapshot = useCallback((doc) => store(doc, true), [store]);
  useSocketListener(VITALS_HEALTH_NAMESPACE, HEALTH_SNAPSHOT_EVENT, onSnapshot, {
    apiVersion: VITALS_WS_APIVERSION,
    enabled: LIVE_FEED_ENABLED,
  });

  // --- REST fallback poll (only when the socket has gone quiet) ---
  useEffect(() => {
    if (MOCK_HEALTH || !VITALS_REST_URL) return undefined;
    let cancelled = false;

    const poll = async () => {
      if (Date.now() - lastSocketAtRef.current < SOCKET_FRESH_MS) return;
      try {
        const res = await fetch(`${VITALS_REST_URL}/health`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const doc = await res.json();
        if (!cancelled) store(doc, false);
      } catch (_) {
        // Leave the last document in place; staleness will grey the view.
      }
    };

    poll();
    const id = window.setInterval(poll, REST_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [store]);

  // --- Mock keepalive: keep the fixture fresh so the preview doesn't grey ---
  useEffect(() => {
    if (!MOCK_HEALTH) return undefined;
    const id = window.setInterval(() => {
      const nowIso = new Date().toISOString();
      store(
        {
          ...HEALTH_FIXTURE,
          generated_at: nowIso,
          sources: {
            ...HEALTH_FIXTURE.sources,
            vitals: { ...HEALTH_FIXTURE.sources.vitals, generated_at: nowIso },
          },
        },
        false
      );
    }, MOCK_KEEPALIVE_MS);
    return () => window.clearInterval(id);
  }, [store]);

  return { document, receivedAt };
}
