import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import SelectShutterMode from "./SelectShutterMode.jsx";
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

test("emits SHU mode change payload", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const state = bootstrapState({
    webSocketNamespace: "",
    currentCamData: { SHU: ["1/60", "1/120", "1/240"] },
    camHeartbeatData: { exposure: "MAN", shutter: "1/60" },
    exposureControlsEnabled: true,
  });

  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByRole, getByText } = renderWithProviders(<SelectShutterMode />, {
    store,
  });

  await h.connected;
  await user.click(getByRole("combobox"));
  await user.click(getByText("Shutter: 1/120"));

  const { data } = await h.gotCmd;
  expect(data[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: null,
    action: { name: COMMAND_STRINGS.shutterModeCommand, value: "1/120" },
  });
});
