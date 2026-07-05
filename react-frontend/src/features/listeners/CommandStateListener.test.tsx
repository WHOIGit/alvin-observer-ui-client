import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "../camera-controls/cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { renderWithProviders } from "../../../tests/renderWithProviders";
import { getSharedImagingClient } from "../../lib/imaging-client";
import CommandStateListener from "./CommandStateListener.jsx";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function makeStore(overrides: Partial<CameraControlsState> = {}) {
  const baseState = cameraControlsReducer(undefined, { type: "@@INIT" } as any);
  return configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: { ...baseState, ...overrides } },
  });
}

afterEach(() => {
  cleanup();
  // Drop any sockets left open by unpinned commands so the next test's
  // harness observes a fresh connection.
  getSharedImagingClient().close();
});

test("mirrors outgoing commands into lastCommand and the ack queue", async () => {
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit("newCameraCommand");
  });

  const store = makeStore({ observerSide: "P" });
  renderWithProviders(<CommandStateListener />, { store });

  const { payload } = getSharedImagingClient()
    .station("P")
    .camera("port_brow_4k")
    .setIso("400");

  // The command is recorded synchronously, before any server round-trip,
  // so a fast acknowledgment can never miss the queue entry.
  const state = store.getState().cameraControls;
  expect(state.lastCommand).toMatchObject({
    eventId: payload.eventId,
    camera: "port_brow_4k",
    command: "COVP",
    action: { name: "ISO", value: "400" },
    status: "PENDING",
  });
  expect(state.commandsQueue).toHaveLength(1);
  expect(state.commandsQueue[0].eventId).toBe(payload.eventId);

  // The store's PENDING mutation must not leak into the wire payload.
  await h.connected;
  const { namespace, args } = await h.gotCmd;
  expect(namespace).toBe("/port");
  expect(args[0]).toEqual({
    eventId: payload.eventId,
    timestamp: expect.any(String),
    camera: "port_brow_4k",
    command: "COVP",
    action: { name: "ISO", value: "400" },
  });
});

test("stops mirroring once unmounted", () => {
  const store = makeStore({ observerSide: "P" });
  const { unmount } = renderWithProviders(<CommandStateListener />, { store });
  unmount();

  getSharedImagingClient().station("P").camera(null).setIso("100");
  expect(store.getState().cameraControls.lastCommand).toBe(null);
  expect(store.getState().cameraControls.commandsQueue).toHaveLength(0);
});
