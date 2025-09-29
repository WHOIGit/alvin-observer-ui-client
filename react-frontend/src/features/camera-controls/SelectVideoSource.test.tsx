import { afterEach, expect, test } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./cameraControlsSlice.js";
import { createSocketIoHarness } from "../../../tests/socket.io-harness";
import { NEW_CAMERA_COMMAND_EVENT, COMMAND_STRINGS } from "../../config.js";
import SelectVideoSource from "./SelectVideoSource.jsx";
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

test("emits camera change payload on select", async () => {
  const user = userEvent.setup();
  const h = createSocketIoHarness((h, expectEmit) => {
    h.gotCmd = expectEmit(NEW_CAMERA_COMMAND_EVENT);
  });

  const allCameras = [
    { camera: "cam-1", cam_name: "Cam 1" },
    { camera: "cam-2", cam_name: "Cam 2" },
  ] as any;

  const state = bootstrapState({
    webSocketNamespace: "",
    allCameras,
    activeCamera: allCameras[0],
    camHeartbeatData: { camera: "cam-1", owner: "port" },
    observerSide: "PL",
    videoSourceEnabled: true,
  });

  const store = configureStore({
    reducer: { cameraControls: cameraControlsReducer },
    preloadedState: { cameraControls: state },
  });

  const { getByRole, getByText } = renderWithProviders(<SelectVideoSource />, {
    store,
  });

  await h.connected;
  await user.click(getByRole("combobox", { name: /Video Source/i }));
  await user.click(getByText("Cam 2"));

  const { data } = await h.gotCmd;
  expect(data[0]).toEqual({
    eventId: expect.any(String),
    timestamp: expect.any(String),
    camera: "cam-1",
    command: "COPL",
    action: { name: COMMAND_STRINGS.cameraChangeCommand, value: "cam-2" },
  });
});
