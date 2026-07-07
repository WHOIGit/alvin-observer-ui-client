/**
 * Imaging System client library.
 *
 * This is the only module the application may import from; everything else
 * in this directory is an implementation detail of the wire protocol. In
 * particular, the v1 message shapes in wire.ts are internal — the durable
 * contract is the client API (stations, camera handles, typed channels)
 * plus the domain vocabulary exported here.
 */

export { createImagingClient, getSharedImagingClient } from "./client";
export type {
  CameraHandle,
  CommandContext,
  ImagingClient,
  ImagingClientOptions,
  RecordOptions,
  Station,
} from "./client";

export { COMMAND_KINDS, CommandFailedError } from "./commands";
export type { CommandKind } from "./commands";

export {
  EXPOSURE_MODES,
  FOCUS_CONTROLS,
  FOCUS_MODES,
  WHITE_BALANCE_MODES,
  ZOOM_CONTROLS,
} from "./domain";
export type {
  ExposureMode,
  FocusControl,
  FocusMode,
  WhiteBalanceMode,
  ZoomControl,
} from "./domain";

export { STATIONS, getStationInfo } from "./protocol";
export type { StationId, StationIdInput, StationInfo } from "./protocol";

export type {
  CamHeartbeat,
  CameraSettings,
  RecorderHeartbeat,
  RecorderHeartbeatObserver,
  RecorderHeartbeatPilot,
} from "./telemetry";

export type {
  CommandResult,
  ConnectionStatus,
  ConnectionStatusEvent,
  SentCommand,
  Unsubscribe,
  WsEndpoint,
  WsEndpoints,
} from "./types";
