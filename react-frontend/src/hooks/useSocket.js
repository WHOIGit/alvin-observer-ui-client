import { useEffect, useRef } from "react";
import { unstable_getSharedConnectionPool } from "../lib/imaging-client";

/**
 * @deprecated Transitional shim over the imaging-client library's shared
 * connection pool. New code should use the semantic hooks in
 * useImagingClient.js (or the library directly) instead of raw sockets.
 * This file is deleted once the last consumer migrates.
 */
export function useSocket(namespace = "/", { apiVersion = "1" } = {}) {
  const pool = unstable_getSharedConnectionPool();
  const heldRef = useRef(null);

  useEffect(() => {
    const held = pool.acquire(namespace, apiVersion);
    heldRef.current = held;

    return () => {
      heldRef.current = null;
      held.release();
    };
  }, [pool, namespace, apiVersion]);

  // Like the original hook, the socket is available during the first render,
  // before the effect has taken its reference.
  return heldRef.current
    ? heldRef.current.socket
    : pool.get(namespace, apiVersion);
}

/** @deprecated See useSocket. */
export function useSocketListener(
  namespace = "/",
  event,
  callback,
  { apiVersion = "1" } = {}
) {
  const socket = useSocket(namespace, { apiVersion });
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
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
