/**
 * Shared Socket.IO connection pool, keyed by `${apiVersion}:${namespace}` so
 * the same namespace name can coexist on different backend API versions.
 *
 * This is the only module in the application that may import socket.io-client.
 */

import socketIOClient from "socket.io-client";
import type { Socket } from "socket.io-client";
import { EVENTS } from "./protocol";
import type { WsEndpoints } from "./types";

interface PoolEntry {
  socket: Socket;
  refCount: number;
  key: string;
}

export interface ConnectionPool {
  /**
   * Returns the pooled socket for a namespace, creating it (with refCount 0)
   * if absent. Used for emitting outside a held reference; the entry is
   * adopted by the next acquire() for the same namespace.
   */
  get(namespace?: string, apiVersion?: string): Socket;
  /**
   * Returns the pooled socket plus a release function. When the last
   * reference is released the connection sends the historical ICS good-bye
   * and disconnects.
   */
  acquire(namespace?: string, apiVersion?: string): { socket: Socket; release: () => void };
  /**
   * Hard teardown: disconnect every pooled socket regardless of reference
   * count, without the good-bye. Outstanding releases become no-ops.
   */
  closeAll(): void;
}

export function createConnectionPool(getEndpoints: () => WsEndpoints): ConnectionPool {
  const pool = new Map<string, PoolEntry>();

  function getOrCreate(namespace: string, apiVersion: string): PoolEntry {
    const key = `${apiVersion}:${namespace}`;
    let entry = pool.get(key);
    if (!entry) {
      const endpoints = getEndpoints();
      const endpoint = endpoints ? endpoints[apiVersion] : undefined;
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

  return {
    get(namespace = "/", apiVersion = "1") {
      return getOrCreate(namespace, apiVersion).socket;
    },

    acquire(namespace = "/", apiVersion = "1") {
      const entry = getOrCreate(namespace, apiVersion);
      entry.refCount += 1;

      let released = false;
      const release = () => {
        if (released) return;
        released = true;

        // The pool may have been hard-closed since this was acquired.
        if (pool.get(entry.key) !== entry) return;

        entry.refCount -= 1;
        if (entry.refCount <= 0) {
          pool.delete(entry.key);

          // Good bye message to server is a historical part of the ICS
          // protocol, sent before the transport goes down.
          try {
            const client = namespace.startsWith("/")
              ? namespace.slice(1)
              : namespace;
            entry.socket.emit(EVENTS.disconnectEvent, { client });
          } catch (_) {
            /* best effort */
          }

          entry.socket.disconnect();
        }
      };

      return { socket: entry.socket, release };
    },

    closeAll() {
      for (const entry of pool.values()) {
        try {
          entry.socket.disconnect();
        } catch (_) {
          /* best effort */
        }
      }
      pool.clear();
    },
  };
}
