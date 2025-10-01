import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import {
  NEW_CAMERA_COMMAND_EVENT,
  COMMAND_STRINGS,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PORT,
} from "../../config.js";
import PilotRecordButton from "./PilotRecordButton.jsx";
import { renderWithProviders } from "../../../tests/renderWithProviders";

type CameraControlsState = ReturnType<typeof cameraControlsReducer>;

function bootstrapState(overrides: Partial<CameraControlsState> = {}) {
  const base = cameraControlsReducer(undefined, {
    type: "@@INIT",
  } as any) as any;
  return { ...base, ...overrides } as any;
}

afterEach(() => {
  cleanup();
});

test.each([
  {
    side: WS_SERVER_NAMESPACE_PORT,
    label: /Record port Source/i,
    expected: "cam-port",
    command: "COVP",
  },
  {
    side: WS_SERVER_NAMESPACE_STARBOARD,
    label: /Record stbd Source/i,
    expected: "cam-stbd",
    command: "COVS",
  },
])(
  "emits REC payload with observerSideOverride %s",
  async ({ side, label, expected, command }) => {
    const user = userEvent.setup();
    const h = createSocketIoHarness((h, expectEmit) => {
      h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
    });

    const state = bootstrapState({
      webSocketNamespace: "",
      camHeartbeatDataPort: { camera: "cam-port" },
      camHeartbeatDataStbd: { camera: "cam-stbd" },
    });

    const store = configureStore({
      reducer: { cameraControls: cameraControlsReducer },
      preloadedState: { cameraControls: state },
    });

    const { getByText } = renderWithProviders(
      <PilotRecordButton observerSide={side} />,
      { store },
    );

    await h.connected;
    await user.click(getByText(label));

    const { namespace, args } = await h.gotCmd;
    expect(namespace).toBe("/");
    expect(args[0]).toEqual({
      eventId: expect.any(String),
      timestamp: expect.any(String),
      camera: null,
      command: command,
      observerSideOverride: side,
      action: { name: COMMAND_STRINGS.recordSourceCommand, value: expected },
    });
  },
);
