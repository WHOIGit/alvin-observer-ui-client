/**
 * API-level types for the imaging client — the shapes consumers program
 * against. Wire-format message types live in wire.ts and are internal.
 *
 * Note the current transitional caveat: incoming channel payloads and
 * SentCommand.payload are still raw v1 wire messages (see wire.ts), so a
 * few wire types leak through these signatures until telemetry
 * normalization lands.
 */

import type { CameraCommandPayload, CommandReceipt } from "./wire";

export type WsEndpoint = { server: string; path: string };

/** One entry per backend API version ("1", "1.5"). */
export type WsEndpoints = Record<string, WsEndpoint>;

export type ConnectionStatus = "connected" | "disconnected" | "error";

export interface ConnectionStatusEvent {
  status: ConnectionStatus;
}

export type Unsubscribe = () => void;

export interface SentCommand {
  /** The exact payload emitted on the wire. */
  payload: CameraCommandPayload;
  /**
   * Resolves with the server's receipt for this command's eventId. Never
   * rejects; commands that are never acknowledged simply never resolve.
   */
  ack: Promise<CommandReceipt>;
}
