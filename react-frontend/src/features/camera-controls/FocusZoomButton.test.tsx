import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import { SOCKET_USER_SCENARIOS } from "../../../tests/socket-user-scenarios";
import FocusZoomButton from "./FocusZoomButton.jsx";
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
  "emits step focus once on click ($name)",
  async (scenario) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.step = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeStore({
      observerSide: scenario.observerSide,
      webSocketNamespace: scenario.namespace.replace(/^\//, ""),
      camHeartbeatData: { focus_mode: "MF" },
    });

    const { getByText } = renderWithProviders(
      <FocusZoomButton
        id={1}
        buttonFunction="focus"
        label="Focus Near"
        commandStringControl={COMMAND_STRINGS.focusControlCommand}
        commandStringOneStop={COMMAND_STRINGS.focusNearOneStop}
        commandStringContinuous={COMMAND_STRINGS.focusNearContinuos}
        activeFocusZoomButton={null}
        sendActiveFocusZoomButtonToParent={() => null}
      />,
      { store },
    );

    await h.connected;
    await user.click(getByText("Focus Near"));

    const { namespace, args } = await h.step;
    expect(namespace).toBe(scenario.namespace);
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.focusControlCommand,
        value: COMMAND_STRINGS.focusNearOneStop,
      },
    });
  },
);

test.each(SOCKET_USER_SCENARIOS)(
  "emits continuous focus on long press ($name)",
  async (scenario) => {
    const h = createSocketIoHarness((h, expectEmit) => {
      h.start = expectEmit(NEW_CAMERA_COMMAND_EVENT);
      h.stop = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const store = makeStore({
      observerSide: scenario.observerSide,
      webSocketNamespace: scenario.namespace.replace(/^\//, ""),
      camHeartbeatData: { focus_mode: "MF" },
    });

    const { getByText } = renderWithProviders(
      <FocusZoomButton
        id={2}
        buttonFunction="focus"
        label="Focus Near Hold"
        commandStringControl={COMMAND_STRINGS.focusControlCommand}
        commandStringOneStop={COMMAND_STRINGS.focusNearOneStop}
        commandStringContinuous={COMMAND_STRINGS.focusNearContinuos}
        activeFocusZoomButton={null}
        sendActiveFocusZoomButtonToParent={() => null}
      />,
      { store },
    );

    await h.connected;
    const user = userEvent.setup();

    const btn = getByText("Focus Near Hold");
    await user.pointer({ target: btn, keys: "[MouseLeft>]" });
    await new Promise((r) => setTimeout(r, 600));

    const start = await h.start;
    expect(start.namespace).toBe(scenario.namespace);
    expect(start.args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.focusControlCommand,
        value: COMMAND_STRINGS.focusNearContinuos,
      },
    });

    await user.pointer({ target: btn, keys: "[/MouseLeft]" });

    const stop = await h.stop;
    expect(stop.namespace).toBe(scenario.namespace);
    expect(stop.args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: scenario.cameraCommand,
      action: {
        name: COMMAND_STRINGS.focusControlCommand,
        value: COMMAND_STRINGS.focusStop,
      },
    });
  },
);
