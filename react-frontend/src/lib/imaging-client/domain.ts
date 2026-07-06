/**
 * Domain vocabulary for the imaging system — the constants the application
 * speaks when driving cameras.
 *
 * The values happen to match protocol v1's wire encodings, but consumers
 * must treat them as opaque: only this library may assume their wire
 * meaning. Names mirror the backend's enums in suboptica's icstypes.py so
 * both ends of the system share one vocabulary.
 */

export const EXPOSURE_MODES = {
  AUTO: "AUTO",
  MANUAL: "MAN",
  SHUTTER_PRIORITY: "SP",
  IRIS_PRIORITY: "IP",
} as const;
export type ExposureMode = (typeof EXPOSURE_MODES)[keyof typeof EXPOSURE_MODES];

export const FOCUS_MODES = {
  AUTOFOCUS: "AF",
  MANUAL: "MF",
} as const;
export type FocusMode = (typeof FOCUS_MODES)[keyof typeof FOCUS_MODES];

/** One-shot or continuous focus drive; STOP ends a continuous move. */
export const FOCUS_CONTROLS = {
  FAR_CONTINUOUS: "FC",
  FAR_ONE_STOP: "FS",
  NEAR_CONTINUOUS: "NC",
  NEAR_ONE_STOP: "NS",
  STOP: "ST",
} as const;
export type FocusControl = (typeof FOCUS_CONTROLS)[keyof typeof FOCUS_CONTROLS];

/** One-shot or continuous zoom drive; STOP ends a continuous move. */
export const ZOOM_CONTROLS = {
  TELEPHOTO_CONTINUOUS: "TC",
  TELEPHOTO_ONE_STOP: "TS",
  WIDE_CONTINUOUS: "WC",
  WIDE_ONE_STOP: "WS",
  STOP: "ST",
} as const;
export type ZoomControl = (typeof ZOOM_CONTROLS)[keyof typeof ZOOM_CONTROLS];

/**
 * Selectable white-balance modes. The one-push mode is armed by selecting
 * ONE_PUSH and fired with CameraHandle.triggerOnePushWhiteBalance().
 */
export const WHITE_BALANCE_MODES = {
  AUTO: "AUTO",
  INDOOR: "INDOOR",
  OUTDOOR: "OUTDOOR",
  ONE_PUSH: "ONE_PUSH_WB",
} as const;
export type WhiteBalanceMode =
  (typeof WHITE_BALANCE_MODES)[keyof typeof WHITE_BALANCE_MODES];
