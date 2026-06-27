import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import { WS_ENDPOINTS } from "../config";

// Shared socket pool keyed by `${apiVersion}:${namespace}` so the same
// namespace name can coexist on different backend API versions.
const pool = new Map();

function getOrCreate(namespace, apiVersion) {
  const key = `${apiVersion}:${namespace}`;
  let entry = pool.get(key);
  if (!entry) {
    const endpoint = WS_ENDPOINTS[apiVersion];
    if (!endpoint) {
      throw new Error(`No WS_ENDPOINTS entry for API version ${apiVersion}`);
    }
    const socket = socketIOClient(endpoint.server + namespace, {
      path: endpoint.path + "socket.io",
      transports: ["websocket"],
    });
    entry = { socket, refCount: 0, key };
    pool.set(key, entry);
  }
  return entry;
}

// `enabled: false` skips the connection entirely (returns null) so a caller can
// opt out without breaking the rules of hooks — used when a feature's endpoint
// is unconfigured or it's running off mock data.
export function useSocket(namespace = "/", { apiVersion = "1", enabled = true } = {}) {
  const entryRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const entry = getOrCreate(namespace, apiVersion);
    entry.refCount += 1;
    entryRef.current = entry;

    return () => {
      const e = entryRef.current;
      if (!e) return;
      e.refCount -= 1;
      if (e.refCount <= 0) {
        pool.delete(e.key);

        // Good bye message to server is a historical part of the ICS protocol
        try {
          const client = namespace.startsWith("/")
            ? namespace.slice(1)
            : namespace;
          e.socket.emit("disconnectEvent", { client });
        } catch (_) {}

        e.socket.disconnect();
      }
    };
  }, [namespace, apiVersion, enabled]);

  if (!enabled) return null;
  return entryRef.current
    ? entryRef.current.socket
    : getOrCreate(namespace, apiVersion).socket;
}

export function useSocketListener(
  namespace = "/",
  event,
  callback,
  { apiVersion = "1", enabled = true } = {}
) {
  const socket = useSocket(namespace, { apiVersion, enabled });
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!socket) return undefined;
    const handler = (msg) => {
      if (callbackRef.current) {
        callbackRef.current(msg);
      }
    };
    socket.on(event, handler);
    return () => {
      try {
        socket.off(event, handler);
      } catch (_) {}
    };
  }, [socket, event]);
}
