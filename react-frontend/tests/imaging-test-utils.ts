// Shared helpers for tests that exercise the imaging-client library through
// the MSW wire harness (see socket.io-harness.ts).

import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../src/features/camera-controls/cameraControlsSlice.js";
import type { Station } from "../src/lib/imaging-client";
import type { SocketIoHarness } from "./socket.io-harness";

/** Emit a server → client event on a specific Socket.IO namespace. */
export function emitTo(
  h: SocketIoHarness,
  namespace: string,
  event: string,
  ...args: any[]
) {
  // The harness signature takes an event name, but the underlying binding
  // also accepts an {event, namespace} envelope as the first argument.
  h.emit({ event, namespace } as any, ...args);
}

/** Resolves once the station's namespace connection is established. */
export function stationConnected(station: Station): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = station.onConnectionStatus(({ status }) => {
      if (status === "connected") {
        // Defer so the unsubscribe doesn't run inside the callback loop.
        queueMicrotask(() => {
          unsubscribe();
          resolve();
        });
      }
    });
  });
}

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

/** Redux store with the camera-controls slice, preloaded with overrides. */
export function makeCameraControlsStore(
  overrides: Partial<CameraControlsState> = {}
) {
  const baseState = cameraControlsReducer(undefined, { type: "@@INIT" } as any);
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}
