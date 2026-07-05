import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../camera-controls/cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import { getSharedImagingClient } from "../../lib/imaging-client";
import NewCameraCommandListener from "./NewCameraCommandListener.jsx";

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

test("routes configuration broadcasts and receipts into Redux", async () => {
  const h = createSocketIoHarness();

  // A pending ISO change, as CommandStateListener would have queued it.
  const queuedCommand = {
    eventId: "evt-1",
    camera: "port_brow_4k",
    command: "COVP",
    action: { name: "ISO", value: "400" },
  };
  const store = makeStore({
    observerSide: "P",
    commandsQueue: [queuedCommand] as any,
  });
  renderWithProviders(<NewCameraCommandListener />, { store });

  await stationConnected("P");

  const cameraArray = [{ camera: "c1", cam_name: "Brow", owner: "port" }];
  const inputArray = [{ label: "Brow", value: "input1" }];
  const outputArray = [{ label: "Port Rec", value: "output1" }];

  emitTo(h, "/port", "newCameraCommand", { camera_array: cameraArray });
  emitTo(h, "/port", "newCameraCommand", { router_input_array: inputArray });
  emitTo(h, "/port", "newCameraCommand", { router_output_array: outputArray });
  emitTo(h, "/port", "newCameraCommand", {
    ISO: ["100", "400"],
    SHU: ["1/30"],
    IRS: ["F2.8"],
    current_settings: { ISO: "100" },
  });
  // The receipt for the queued command arrives last and resolves it.
  emitTo(h, "/port", "newCameraCommand", {
    eventId: "evt-1",
    receipt: { command: "COVP", status: "OK" },
  });

  await vi.waitFor(() =>
    expect(store.getState().cameraControls.commandsQueue).toHaveLength(0)
  );

  const state = store.getState().cameraControls;
  expect(state.allCameras).toEqual(cameraArray);
  expect(state.routerInputs).toEqual(inputArray);
  expect(state.routerOutputs).toEqual(outputArray);
  expect(state.currentCamData.ISO).toEqual(["100", "400"]);
  // The OK receipt applied the queued ISO value to the live settings.
  expect(state.currentCamData.currentSettings.ISO).toBe("400");
  expect(state.errorCameraChange).toBe(false);
});

test("an error receipt flags the failure and clears the queue", async () => {
  const h = createSocketIoHarness();
  const store = makeStore({
    observerSide: "S",
    commandsQueue: [
      { eventId: "evt-9", action: { name: "SHU", value: "1/60" } },
    ] as any,
    currentCamData: { currentSettings: {} } as any,
  });
  renderWithProviders(<NewCameraCommandListener />, { store });

  await stationConnected("S");
  emitTo(h, "/stbd", "newCameraCommand", {
    eventId: "evt-9",
    receipt: { command: "COVS", status: "ERR" },
  });

  await vi.waitFor(() =>
    expect(store.getState().cameraControls.commandsQueue).toHaveLength(0)
  );
  expect(store.getState().cameraControls.errorCameraChange).toBe(true);
});
