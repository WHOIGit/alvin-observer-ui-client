import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import { WS_SERVER, WS_PATH } from "../config";

// Simple shared socket pool by namespace (e.g., "/", "/pilot", "/port").
const pool = new Map();

function getOrCreate(namespace) {
  let entry = pool.get(namespace);
  if (!entry) {
    const socket = socketIOClient(WS_SERVER + namespace, {
      path: WS_PATH + "socket.io",
      transports: ["websocket"],
    });
    entry = { socket, refCount: 0 };
    pool.set(namespace, entry);
  }
  return entry;
}

export function useSocket(namespace = "/") {
  const entryRef = useRef(null);

  useEffect(() => {
    const entry = getOrCreate(namespace);
    entry.refCount += 1;
    entryRef.current = entry;

    return () => {
      const e = entryRef.current;
      if (!e) return;
      e.refCount -= 1;
      if (e.refCount <= 0) {
        pool.delete(namespace);

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
  }, [namespace]);

  return entryRef.current
    ? entryRef.current.socket
    : getOrCreate(namespace).socket;
}

export function useSocketListener(namespace = "/", event, callback) {
  const socket = useSocket(namespace);
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
