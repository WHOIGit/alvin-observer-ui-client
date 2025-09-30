import {
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../config";

const SIDE_TO_NAMESPACE = {
  P: WS_SERVER_NAMESPACE_PORT,
  S: WS_SERVER_NAMESPACE_STARBOARD,
  PL: WS_SERVER_NAMESPACE_PILOT,
};

const SIDE_TO_COMMAND = {
  P: "COVP",
  S: "COVS",
  PL: "COPL",
};

function normalizeObserverSideInput(rawSide) {
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

export function getObserverInfo(rawSide) {
  const observerSide = normalizeObserverSideInput(rawSide) ?? "PL";
  const namespace = SIDE_TO_NAMESPACE[observerSide];
  const command = SIDE_TO_COMMAND[observerSide];

  return {
    observerSide,
    namespace,
    namespacePath: `/${namespace}`,
    command,
  };
}

export function observerSideToNamespace(rawSide) {
  return getObserverInfo(rawSide).namespace;
}

export function observerSideToNamespacePath(rawSide) {
  return getObserverInfo(rawSide).namespacePath;
}

export function observerSideToCommand(rawSide) {
  if (rawSide === undefined || rawSide === null || rawSide === "") {
    return undefined;
  }
  return getObserverInfo(rawSide).command;
}

export function coerceObserverSide(rawSide) {
  return getObserverInfo(rawSide).observerSide;
}
