import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import SelectExposureMode from "./SelectExposureMode.jsx";
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

test("emits EXP mode change payload", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    camHeartbeatData: {
      exposure: COMMAND_STRINGS.exposureModeOptions[0],
      camctrl: "y",
      camera: "cam-1",
      owner: "port",
    },
    observerSide: "PL",
    allCameras: [{ camera: "cam-1", cam_name: "Cam 1" }],
    activeCamera: { camera: "cam-1", cam_name: "Cam 1" } as any,
  });

  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByRole, getByText } = renderWithProviders(
    <SelectExposureMode showLabel="horizontal" />,
    { store },
  );

  await h.connected;
  await user.click(getByRole("combobox"));
  await user.click(getByText("Manual"));

  const { namespace, args } = await h.gotCmd;
  expect(namespace).toBe("/");
  expect(args[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: "cam-1",
    command: "COPL",
    action: {
      name: COMMAND_STRINGS.exposureModeCommand,
      value: COMMAND_STRINGS.exposureModeOptions[1],
    },
  });
});
