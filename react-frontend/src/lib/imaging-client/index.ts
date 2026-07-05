/**
 * Imaging System client library.
 *
 * This is the only module the application may import from; everything else
 * in this directory is an implementation detail of the wire protocol.
 */

export {
  createImagingClient,
  getSharedImagingClient,
  unstable_getSharedConnectionPool,
} from "./client";
export type {
  CameraHandle,
  CommandContext,
  ImagingClient,
  ImagingClientOptions,
  RecordOptions,
  Station,
} from "./client";

export {
  coerceObserverSide,
  getObserverInfo,
  normalizeObserverSide,
  observerSideToCommand,
  observerSideToNamespace,
  observerSideToNamespacePath,
} from "./protocol";
export type { ObserverSide, ObserverSideInput, ObserverInfo } from "./protocol";

export type {
  CamHeartbeat,
  CameraArrayEntry,
  CameraCommandAction,
  CameraCommandBody,
  CameraCommandPayload,
  CameraSettingsCurrent,
  CameraSettingsPayload,
  CommandReceipt,
  ConnectionStatus,
  ConnectionStatusEvent,
  ExposureMode,
  FocusControl,
  FocusMode,
  NavHeartbeat,
  RecorderHeartbeat,
  RecorderHeartbeatObserver,
  RecorderHeartbeatPilot,
  ReceiptStatus,
  SensorHeartbeat,
  SentCommand,
  SystemMessage,
  Unsubscribe,
  User,
  WhiteBalanceMode,
  WsEndpoint,
  WsEndpoints,
  ZoomControl,
} from "./types";
