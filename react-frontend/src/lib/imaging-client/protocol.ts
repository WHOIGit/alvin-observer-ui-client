/**
 * Protocol constants and pure helpers for the legacy ICS wire format.
 *
 * Command names (COVP/COVS/COPL) are scoped by namespace; they don't carry
 * information beyond confirming that the intent matches the channel.
 */

import formatISO from "date-fns/formatISO";
import type { CameraCommandBody, CameraCommandPayload } from "./wire";

/** The imaging system's stations, by their normalized identifiers. */
export const STATIONS = {
  PORT: "P",
  STARBOARD: "S",
  PILOT: "PL",
} as const;

/** Normalized station identifiers used throughout the app. */
export type StationId = (typeof STATIONS)[keyof typeof STATIONS];

/** Anything accepted where a station is expected: "P", "port", "/stbd", ... */
export type StationIdInput = StationId | string | null | undefined;

export const NAMESPACE_ROOT = "/";
export const NAMESPACE_SYSTEM = "/system";

const STATION_TO_NAMESPACE: Record<StationId, string> = {
  [STATIONS.PORT]: "port",
  [STATIONS.STARBOARD]: "stbd",
  [STATIONS.PILOT]: "pilot",
};

const STATION_TO_COMMAND: Record<StationId, string> = {
  [STATIONS.PORT]: "COVP",
  [STATIONS.STARBOARD]: "COVS",
  [STATIONS.PILOT]: "COPL",
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

export function normalizeStationId(rawStation: StationIdInput): StationId | null {
  if (!rawStation) return null;
  const value = `${rawStation}`.trim();
  if (!value) return null;
  const withoutSlash = value.startsWith("/") ? value.slice(1) : value;
  const upperValue = withoutSlash.toUpperCase();

  if (upperValue === "P" || upperValue === "PORT") {
    return STATIONS.PORT;
  }
  if (upperValue === "S" || upperValue === "STBD" || upperValue === "STARBOARD") {
    return STATIONS.STARBOARD;
  }
  if (upperValue === "PL" || upperValue === "PILOT") {
    return STATIONS.PILOT;
  }

  return null;
}

export interface StationInfo {
  stationId: StationId;
  namespace: string;
  namespacePath: string;
  command: string;
}

/** Unrecognized input coerces to the pilot, matching historical behavior. */
export function getStationInfo(rawStation: StationIdInput): StationInfo {
  const stationId = normalizeStationId(rawStation) ?? STATIONS.PILOT;
  const namespace = STATION_TO_NAMESPACE[stationId];
  const command = STATION_TO_COMMAND[stationId];

  return {
    stationId,
    namespace,
    namespacePath: `/${namespace}`,
    command,
  };
}

export function stationToCommand(rawStation: StationIdInput): string | undefined {
  if (rawStation === undefined || rawStation === null || rawStation === "") {
    return undefined;
  }
  return getStationInfo(rawStation).command;
}

export interface BuildCameraCommandOptions {
  station: StationIdInput;
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
 * omitted entirely when the station is unknown.
 */
export function buildCameraCommand({
  station,
  activeCamera,
  body,
  uuid,
  now,
}: BuildCameraCommandOptions): CameraCommandPayload {
  let camera = activeCamera ?? null;
  if ("oldCamera" in body) {
    camera = body.oldCamera ?? null;
  }

  const command = stationToCommand(body.observerSideOverride ?? station);

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
