import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useImagingClient } from "../../hooks/useImagingClient";
import {
  selectActiveCamera,
  selectCamHeartbeatFor,
  selectOwnStationId,
} from "./cameraControlsSlice";

// Ambient identity for a camera-control subtree: which station the subtree
// observes, and a command handle for that station's current camera. Identity
// only — telemetry stays in Redux, so consumers don't re-render at heartbeat
// frequency.
//
// Commands issued through this context act on the observed station directly.
// Operations the pilot delegates to an observer station (record with `as`)
// must instead use useOwnStation(), so the command travels on the console's
// own namespace as the wire protocol requires.
const ObservedCameraContext = createContext(undefined);

export function ObservedCameraProvider({ station = null, children }) {
  const ownStationId = useSelector(selectOwnStationId);
  const activeCameraId = useSelector(selectActiveCamera);
  const client = useImagingClient();

  // Until the user picks a station there is no one to talk to (and no
  // connection to pin). Controls render nothing before telemetry arrives,
  // so a null handle is never dereferenced in a handler.
  const stationInput = station ?? ownStationId;
  const stationHandle = stationInput ? client.station(stationInput) : null;
  const isOwnStation =
    stationHandle !== null && stationHandle.id === ownStationId;

  useEffect(() => stationHandle?.acquire(), [stationHandle]);

  // The own station's camera is the interactive selection (optimistic,
  // receipt-confirmed); a mirrored station's camera is whatever its
  // heartbeat last reported — all we can know about another console.
  const mirrorCameraId = useSelector((state) =>
    stationHandle && !isOwnStation
      ? selectCamHeartbeatFor(state, stationHandle.id)?.camera ?? null
      : null
  );
  const cameraId = isOwnStation ? activeCameraId : mirrorCameraId;

  const value = useMemo(
    () => ({
      station: stationHandle,
      camera: stationHandle ? stationHandle.camera(cameraId ?? null) : null,
    }),
    [stationHandle, cameraId]
  );

  return (
    <ObservedCameraContext.Provider value={value}>
      {children}
    </ObservedCameraContext.Provider>
  );
}

function useObservedCameraContext() {
  const context = useContext(ObservedCameraContext);
  if (context === undefined) {
    throw new Error(
      "useObservedStation/useObservedCamera require an <ObservedCameraProvider> ancestor"
    );
  }
  return context;
}

/** The station this subtree observes; null until a station is set. */
export function useObservedStation() {
  return useObservedCameraContext().station;
}

/** Command handle for the observed camera; null until a station is set. */
export function useObservedCamera() {
  return useObservedCameraContext().camera;
}

/**
 * The console's own station, independent of any surrounding provider. This
 * is the station delegated operations must be issued on (the pilot records
 * an observer's camera via ownStation.record(cam, { as })). Pins the
 * connection while mounted, per the library's contract for command-issuing
 * UIs — a mirror provider only pins its own station's namespace.
 */
export function useOwnStation() {
  const ownStationId = useSelector(selectOwnStationId);
  const client = useImagingClient();
  const station = ownStationId ? client.station(ownStationId) : null;
  useEffect(() => station?.acquire(), [station]);
  return station;
}
