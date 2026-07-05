import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../camera-controls/cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import { getSharedImagingClient } from "../../lib/imaging-client";
import CamHeartbeatListener from "./CamHeartbeatListener.jsx";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function makeStore(overrides: Partial<CameraControlsState> = {}) {
  const baseState = cameraControlsReducer(undefined, { type: "@@INIT" } as any);
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}

/** Emit a server → client event on a specific Socket.IO namespace. */
function emitTo(h: any, namespace: string, event: string, ...args: any[]) {
  h.emit({ event, namespace }, ...args);
}

/** Resolves once the given side's namespace connection is established. */
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

test("feeds the observer's own heartbeat into the main reducer", async () => {
  const h = createSocketIoHarness();
  const store = makeStore({ observerSide: "P" });
  renderWithProviders(<CamHeartbeatListener />, { store });

  await stationConnected("P");
  emitTo(h, "/port", "CamHeartbeat", {
    camera: "port_brow_4k",
    focus_mode: "MF",
  });

  await vi.waitFor(() =>
    expect(store.getState().cameraControls.camHeartbeatData).toMatchObject({
      camera: "port_brow_4k",
      focus_mode: "MF",
    })
  );
});

test.each([
  ["/port", "camHeartbeatDataPort"],
  ["/stbd", "camHeartbeatDataStbd"],
])(
  "pilot override %s routes into %s",
  async (namespaceOverride, stateField) => {
    const h = createSocketIoHarness();
    const store = makeStore({ observerSide: "PL" });
    renderWithProviders(
      <CamHeartbeatListener namespaceOverride={namespaceOverride} />,
      { store }
    );

    await stationConnected(namespaceOverride);
    emitTo(h, namespaceOverride, "CamHeartbeat", { camera: "some_cam" });

    await vi.waitFor(() =>
      expect(
        (store.getState().cameraControls as any)[stateField]
      ).toMatchObject({ camera: "some_cam" })
    );
    // The pilot's own heartbeat slot is untouched by override traffic.
    expect(store.getState().cameraControls.camHeartbeatData).toBe(null);
  }
);
