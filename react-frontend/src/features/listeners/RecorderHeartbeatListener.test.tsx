import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../camera-controls/cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import { getSharedImagingClient } from "../../lib/imaging-client";
import RecorderHeartbeatListener from "./RecorderHeartbeatListener.jsx";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function makeStore(overrides: Partial<CameraControlsState> = {}) {
  const baseState = cameraControlsReducer(undefined, { type: "@@INIT" } as any);
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}

function emitTo(h: any, namespace: string, event: string, ...args: any[]) {
  h.emit({ event, namespace }, ...args);
}

function stationConnected(side: string): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = getSharedImagingClient()
      .station(side)
      .onConnectionStatus(({ status }) => {
        if (status === "connected") {
          queueMicrotask(() => {
            unsubscribe();
            resolve();
          });
        }
      });
  });
}

afterEach(() => {
  cleanup();
  getSharedImagingClient().close();
});

test("stores recorder heartbeats for the observer's own side", async () => {
  const h = createSocketIoHarness();
  const store = makeStore({ observerSide: "S" });
  renderWithProviders(<RecorderHeartbeatListener />, { store });

  await stationConnected("S");
  emitTo(h, "/stbd", "RecorderHeartbeat", {
    command: "SRVS",
    camera: "Stbd Brow",
    recording: "true",
    filename: "clip_0042.mov",
  });

  await vi.waitFor(() =>
    expect(store.getState().cameraControls.recorderHeartbeatData).toMatchObject({
      recording: "true",
      filename: "clip_0042.mov",
    })
  );
});
