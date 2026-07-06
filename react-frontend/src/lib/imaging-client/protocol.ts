/**
 * Protocol constants and pure helpers for the legacy ICS wire format.
 *
 * Command names (COVP/COVS/COPL) are scoped by namespace; they don't carry
 * information beyond confirming that the intent matches the channel.
 */

import formatISO from "date-fns/formatISO";
import type { CameraCommandBody, CameraCommandPayload } from "./wire";

/** Normalized station side identifiers used throughout the app. */
export type ObserverSide = "P" | "S" | "PL";

/** Anything accepted where a side is expected: "P", "port", "/stbd", ... */
export type ObserverSideInput = ObserverSide | string | null | undefined;

export const NAMESPACE_ROOT = "/";
export const NAMESPACE_SYSTEM = "/system";

const SIDE_TO_NAMESPACE: Record<ObserverSide, string> = {
  P: "port",
  S: "stbd",
  PL: "pilot",
};

const SIDE_TO_COMMAND: Record<ObserverSide, string> = {
  P: "COVP",
  S: "COVS",
  PL: "COPL",
};

/** Socket.IO event names (server and client side). */
export const EVENTS = {
  newCameraCommand: "newCameraCommand",
  camHeartbeat: "CamHeartbeat",
  recorderHeartbeat: "RecorderHeartbeat",
  navHeartbeat: "NavHeartbeat",
  sensorHeartbeat: "SensorHeartbeat",
  systemMessage: "SystemMessage",
  /** Historical ICS good-bye, emitted when a namespace connection closes. */
  disconnectEvent: "disconnectEvent",
} as const;

/** Camera command action names, mirroring icstypes.ActionName. */
export const ACTIONS = {
  videoSource: "CAM",
  exposureMode: "EXP",
  shutter: "SHU",
  iris: "IRS",
  iso: "ISO",
  focusMode: "FCM",
  focusControl: "FCS",
  zoomControl: "ZCS",
  panTilt: "PANTILT",
  stillImageCapture: "SIC",
  quickClip: "QCV",
  recordSource: "REC",
  router: "RTR",
  whiteBalance: "WB",
} as const;

/** REC action value that stops the current recording. */
export const RECORD_STOP = "ST";

/**
 * WB action value that fires an armed one-push white balance. Not a mode —
 * the camera is put into ONE_PUSH mode first, then this triggers it.
 */
export const WHITE_BALANCE_ONE_PUSH_TRIGGER = "ONE_PUSH_TRIGGER";

export function normalizeObserverSide(rawSide: ObserverSideInput): ObserverSide | null {
  if (!rawSide) return null;
  const value = `${rawSide}`.trim();
  if (!value) return null;
  const withoutSlash = value.startsWith("/") ? value.slice(1) : value;
  const upperValue = withoutSlash.toUpperCase();

  if (upperValue === "P" || upperValue === "PORT") {
    return "P";
  }
  if (upperValue === "S" || upperValue === "STBD" || upperValue === "STARBOARD") {
    return "S";
  }
  if (upperValue === "PL" || upperValue === "PILOT") {
    return "PL";
  }

  return null;
}

export interface ObserverInfo {
  observerSide: ObserverSide;
  namespace: string;
  namespacePath: string;
  command: string;
}

/** Unrecognized input coerces to the pilot, matching historical behavior. */
export function getObserverInfo(rawSide: ObserverSideInput): ObserverInfo {
  const observerSide = normalizeObserverSide(rawSide) ?? "PL";
  const namespace = SIDE_TO_NAMESPACE[observerSide];
  const command = SIDE_TO_COMMAND[observerSide];

  return {
    observerSide,
    namespace,
    namespacePath: `/${namespace}`,
    command,
  };
}

export function observerSideToNamespace(rawSide: ObserverSideInput): string {
  return getObserverInfo(rawSide).namespace;
}

export function observerSideToNamespacePath(rawSide: ObserverSideInput): string {
  return getObserverInfo(rawSide).namespacePath;
}

export function observerSideToCommand(rawSide: ObserverSideInput): string | undefined {
  if (rawSide === undefined || rawSide === null || rawSide === "") {
    return undefined;
  }
  return getObserverInfo(rawSide).command;
}

export function coerceObserverSide(rawSide: ObserverSideInput): ObserverSide {
  return getObserverInfo(rawSide).observerSide;
}

export interface BuildCameraCommandOptions {
  side: ObserverSideInput;
  /** The station's active camera; becomes the payload's `camera` field. */
  activeCamera?: string | null;
  body: CameraCommandBody;
  uuid: () => string;
  now: () => Date;
}

/**
 * Builds a `newCameraCommand` payload exactly as the historical emitter did:
 * a record-source body's `oldCamera` overrides the `camera` field, an
 * `observerSideOverride` swaps the command prefix, and the `command` key is
 * omitted entirely when the side is unknown.
 */
export function buildCameraCommand({
  side,
  activeCamera,
  body,
  uuid,
  now,
}: BuildCameraCommandOptions): CameraCommandPayload {
  let camera = activeCamera ?? null;
  if ("oldCamera" in body) {
    camera = body.oldCamera ?? null;
  }

  const command = observerSideToCommand(body.observerSideOverride ?? side);

  const payload: CameraCommandPayload = {
    eventId: uuid(),
    timestamp: formatISO(now()),
    camera,
    command,
    ...body,
  };

  if (command === undefined) {
    delete payload.command;
  }

  return payload;
}
