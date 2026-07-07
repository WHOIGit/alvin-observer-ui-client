import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useImagingClient } from "../../hooks/useImagingClient";
import { selectActiveCamera, selectOwnStationId } from "./cameraControlsSlice";

// Ambient identity for the camera-control tree: which station commands are
// issued on, and a command handle for the currently observed camera. Identity
// only — telemetry stays in Redux, so consumers don't re-render at heartbeat
// frequency.
const ObservedCameraContext = createContext(undefined);

export function ObservedCameraProvider({ children }) {
  const ownStationId = useSelector(selectOwnStationId);
  const activeCameraId = useSelector(selectActiveCamera);
  const client = useImagingClient();

  // Until the user picks a side there is no station to talk to (and no
  // connection to pin). Controls render nothing before telemetry arrives,
  // so a null handle is never dereferenced in a handler.
  const station = ownStationId ? client.station(ownStationId) : null;

  useEffect(() => station?.acquire(), [station]);

  const value = useMemo(
    () => ({
      station,
      camera: station ? station.camera(activeCameraId ?? null) : null,
    }),
    [station, activeCameraId]
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

/** The station commands are issued on; null until an observer side is set. */
export function useObservedStation() {
  return useObservedCameraContext().station;
}

/** Command handle for the observed camera; null until an observer side is set. */
export function useObservedCamera() {
  return useObservedCameraContext().camera;
}
