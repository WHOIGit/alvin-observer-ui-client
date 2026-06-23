import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// local imports
import WebRtcPlayer from "../../utils/webrtcplayer";
import { VIDEO_STREAM_CONFIG } from "../../config.js";

WebRtcPlayer.setServer(VIDEO_STREAM_CONFIG.server);
WebRtcPlayer.setProtocol(VIDEO_STREAM_CONFIG.protocol);
WebRtcPlayer.setUrlTemplate(VIDEO_STREAM_CONFIG.urlTemplate);

const StreamRegistryContext = createContext(null);

/**
 * Owns every WebRTC connection for the app, keyed by source URL. A connection
 * is opened the first time any component asks for a given source and reused for
 * everyone else, so two views of the same source (e.g. the OBS mini and the
 * large camera-controls feed) share one connection — swapping between them
 * requires no renegotiation. A connection is closed once nothing is using it.
 */
export function WebRtcProvider({ children }) {
  // Map<src, { player, stream, refs }>
  const registry = useRef(new Map());

  const acquire = useCallback((src) => {
    let entry = registry.current.get(src);
    if (!entry) {
      const player = new WebRtcPlayer(
        null /* no DOM element — connection only */,
        src /* stream */,
        "0" /* channel */
      );
      entry = { player, stream: player.mediastream, refs: 0 };
      registry.current.set(src, entry);
    }
    entry.refs += 1;
    return entry.stream;
  }, []);

  const release = useCallback((src) => {
    const entry = registry.current.get(src);
    if (!entry) return;
    entry.refs -= 1;
    if (entry.refs <= 0) {
      entry.player.close();
      registry.current.delete(src);
    }
  }, []);

  const value = useMemo(() => ({ acquire, release }), [acquire, release]);

  return (
    <StreamRegistryContext.Provider value={value}>
      {children}
    </StreamRegistryContext.Provider>
  );
}

/**
 * Pins a set of sources open for as long as the calling component is mounted,
 * independent of whether any view is currently showing them. Use it at a stable
 * root (e.g. the pilot UI shell) to keep every feed warm across tab switches so
 * swapping views never reconnects. Pass a stable array reference (e.g. a
 * module-level constant) — the connections re-open if the array identity changes.
 */
export function useWarmStreams(srcs) {
  const registry = useContext(StreamRegistryContext);

  useEffect(() => {
    if (!registry) return undefined;
    const held = srcs.filter(Boolean);
    held.forEach((src) => registry.acquire(src));
    return () => held.forEach((src) => registry.release(src));
  }, [registry, srcs]);
}

/**
 * Returns the shared MediaStream for `src`, or null when `src` is falsy or no
 * provider is present. The underlying connection is shared with any other
 * caller using the same `src`, and stays open as long as at least one caller
 * holds it.
 */
export function useStream(src) {
  const registry = useContext(StreamRegistryContext);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (!src || !registry) {
      setStream(null);
      return undefined;
    }
    setStream(registry.acquire(src));
    return () => registry.release(src);
  }, [src, registry]);

  return stream;
}
