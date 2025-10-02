import { afterEach, beforeEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import SetCaptureInterval from "./SetCaptureInterval.jsx";
import { renderWithProviders } from "../../../tests/renderWithProviders";

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
});

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  consoleErrorSpy.mockRestore();
});

test.each(SOCKET_USER_SCENARIOS)(
  "emits Start capture interval payload with selected value ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const namespaceWithoutSlash = scenario.namespace.replace(/^\//, "");

    const store = makeStore({
      observerSide: scenario.observerSide,
      webSocketNamespace: namespaceWithoutSlash,
      camHeartbeatData: { capture_interval: "0" },
    });

    const { getByRole, getByText } = renderWithProviders(
      <SetCaptureInterval />,
      {
        store,
      },
    );

    await h.connected;
    await user.click(getByRole("combobox"));
    const opt = await screen.findByRole("option", { name: "20 secs" });
    await user.click(opt);
    await user.click(getByText("Start"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: { name: COMMAND_STRINGS.captureIntervalCommand, value: "20" },
    });
  },
);

test.each(SOCKET_USER_SCENARIOS)(
  "emits Stop capture interval payload with value 0 ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const namespaceWithoutSlash = scenario.namespace.replace(/^\//, "");

    const store = makeStore({
      observerSide: scenario.observerSide,
      webSocketNamespace: namespaceWithoutSlash,
      camHeartbeatData: { capture_interval: "20" },
    });

    const { getByText } = renderWithProviders(<SetCaptureInterval />, {
      store,
    });

    await h.connected;
    await user.click(getByText("Stop"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: { name: COMMAND_STRINGS.captureIntervalCommand, value: "0" },
    });
  },
);
