import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import SelectIrisMode from "./SelectIrisMode.jsx";
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

test.each(SOCKET_USER_SCENARIOS)(
  "emits IRIS mode change payload ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const namespaceWithoutSlash = scenario.namespace.replace(/^\//, "");

    const store = makeStore({
      observerSide: scenario.observerSide,
      webSocketNamespace: namespaceWithoutSlash,
      currentCamData: { IRS: ["1.8", "2.8", "4.0"] },
      camHeartbeatData: { exposure: "MAN", iris: "1.8" },
      exposureControlsEnabled: true,
    });

    const { getByRole, getByText } = renderWithProviders(<SelectIrisMode />, {
      store,
    });

    await h.connected;
    await user.click(getByRole("combobox"));
    await user.click(getByText("IRIS: 2.8"));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: { name: COMMAND_STRINGS.irisModeCommand, value: "2.8" },
    });
  },
);
