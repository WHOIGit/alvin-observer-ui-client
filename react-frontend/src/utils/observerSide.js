// The side/namespace/command mapping is part of the wire protocol and lives
// in the imaging-client library; this module remains as a convenience
// re-export for app code.
export {
  coerceObserverSide,
  getObserverInfo,
  normalizeObserverSide,
  observerSideToCommand,
  observerSideToNamespace,
  observerSideToNamespacePath,
} from "../lib/imaging-client";
