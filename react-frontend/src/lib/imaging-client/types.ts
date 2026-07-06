/**
 * API-level types for the imaging client — the shapes consumers program
 * against. Wire-format message types live in wire.ts and are internal.
 */

import type { CommandKind } from "./commands";
import type { CameraCommandPayload, CommandReceipt } from "./wire";

export type WsEndpoint = { server: string; path: string };

/** One entry per backend API version ("1", "1.5"). */
export type WsEndpoints = Record<string, WsEndpoint>;

export type ConnectionStatus = "connected" | "disconnected" | "error";

export interface ConnectionStatusEvent {
  status: ConnectionStatus;
}

export type Unsubscribe = () => void;

/** The settled outcome of a command, correlated to its receipt by eventId. */
export interface CommandResult {
  /** Which semantic method issued the command; null for Station.send(). */
  kind: CommandKind | null;
  /** The action value as sent (e.g. the requested ISO). */
  value: unknown;
  /** True when the server's receipt status was "OK". */
  isOk: boolean;
  /** Correlation id; equals payload.eventId. */
  eventId: string;
  /** The outgoing payload (raw wire shape, diagnostics only). */
  payload: CameraCommandPayload;
  /** The raw receipt (diagnostics only). */
  receipt: CommandReceipt;
}

/**
 * A command in flight. Resolves with its CommandResult when the server
 * acknowledges OK, and rejects with CommandFailedError on a non-OK receipt.
 * Commands that never receive a receipt never settle. Rejections of
 * unawaited commands are pre-observed by the library, so fire-and-forget
 * call sites need no error handling.
 *
 * Promises are for call-site-local flow; shared state mirrors should use
 * Station.onCommandResult, the single feed of all settled commands.
 */
export interface SentCommand extends Promise<CommandResult> {
  /** The exact payload emitted on the wire, available synchronously. */
  readonly payload: CameraCommandPayload;
  /** Correlation id, equal to payload.eventId. */
  readonly eventId: string;
}
