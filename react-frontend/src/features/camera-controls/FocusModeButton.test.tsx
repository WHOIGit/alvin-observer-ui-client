import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer, {
  changeCamHeartbeat,
} from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import FocusModeButton from "./FocusModeButton.jsx";
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
  "toggles focus from AF to MF ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeStore({
      observerSide: scenario.observerSide,
      webSocketNamespace: scenario.namespace.replace(/^\//, ""),
    });
    store.dispatch(
      changeCamHeartbeat({ focus_mode: COMMAND_STRINGS.focusAF } as any),
    );

    const { getByText } = renderWithProviders(<FocusModeButton />, { store });

    await h.connected;
    await user.click(getByText(/Focus/i));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.focusModeCommand,
        value: COMMAND_STRINGS.focusMF,
      },
    });
  },
);

test.each(SOCKET_USER_SCENARIOS)(
  "toggles focus from MF to AF ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeStore({
      observerSide: scenario.observerSide,
      webSocketNamespace: scenario.namespace.replace(/^\//, ""),
    });
    store.dispatch(
      changeCamHeartbeat({ focus_mode: COMMAND_STRINGS.focusMF } as any),
    );

    const { getByText } = renderWithProviders(<FocusModeButton />, { store });

    await h.connected;
    await user.click(getByText(/Focus/i));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.focusModeCommand,
        value: COMMAND_STRINGS.focusAF,
      },
    });
  },
);
